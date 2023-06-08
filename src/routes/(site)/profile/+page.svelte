<script lang="ts">
    import properties from "$lib/../properties";
    import type { UserDetailsDTO } from "tfm_common/lib/dto/user";
    import { timeSince } from "$lib/utils/time";
    import type { ActionData } from "./$types";
    import UploadAvatarDialog from "./UploadAvatarDialog.svelte";

    let uploadAvatarDialog: UploadAvatarDialog;
    let updatePersonalInfoForm: HTMLFormElement;

    export let data: {
        auth: UserDetailsDTO,
    };

    export let form: ActionData;

    const registrationTime = new Date(data.auth.registrationTime);
    let accountExists = timeSince(registrationTime);
    setInterval(() => {
        accountExists = timeSince(registrationTime);
    }, 1000);

    function updatePersonalInfo() {
        updatePersonalInfoForm.submit();
        return false;
    }
</script>

<div class="container">
    <div class="profile-window">
        {#if form?.message}
        <div class="error-message">
            {form.message}
        </div>
        {/if}
        <div class="profile-header">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="avatar-container" on:click={ () => { uploadAvatarDialog.showModal(); } }>
                <img class="avatar" src={ data.auth.hasAvatar ? `${properties.apiRootAddress}/user/avatar?id=${data.auth.id}` : "/img/no_avatar.png" } alt="Аватар" />
                <div class="hover-shadow">
                    <div class="edit-icon"></div>
                </div>
            </div>
            <div class="profile-info">
                <h1>{ data.auth.username }</h1>
                <form method="post" action="?/updatePersonalInfo" bind:this={updatePersonalInfoForm}>
                    <div>
                        <b>Пол</b>
                        <select name="sex">
                            <option value="undefined">Не выбран</option>
                            <option value="male" selected={ data.auth.personal.sex === "male" }>👨🏼 мужской</option>
                            <option value="female" selected={ data.auth.personal.sex === "female" }>👩🏼 женский</option>
                        </select>
                    </div>
                    <div>
                        <textarea placeholder="О себе" name="about">{ data.auth.personal.about ?? "" }</textarea>
                    </div>
                    <div>
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a href="javascript:" class="branded" style="float: right;" on:click={updatePersonalInfo}>СОХРАНИТЬ</a>
                    </div>
                </form>
            </div>
        </div>
        <div class="profile-stats">
            <div class="stats">
                <div class="row">
                    <div class="name">Уже на сайте</div>
                    <div class="value">{ accountExists }</div>
                </div>
                <div class="row">
                    <div class="name">Игр сыграно</div>
                    <div class="value">{ data.auth.stats.gamesPlayed }</div>
                </div>
                <div class="row">
                    <div class="name">Побед</div>
                    <div class="value">{ data.auth.stats.gamesWon }</div>
                </div>
                <div class="row">
                    <div class="name">Поражений</div>
                    <div class="value">{ data.auth.stats.gamesPlayed - data.auth.stats.gamesWon }</div>
                </div>
                <div class="row">
                    <div class="name">ELO</div>
                    <div class="value">{ data.auth.stats.elo }</div>
                </div>
            </div>
        </div>
    </div>
</div>

<UploadAvatarDialog bind:this={uploadAvatarDialog} />

<style lang="less">
    @import "/src/vars.less";

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100vh - @navbar-height);
    }

    .profile-window {
        width: 700px;
        background: @background-color;
        border: double 4px @border-color;
        padding: 40px;
    }

    .error-message {
        margin-bottom: 40px;
    }

    .profile-header {
        display: flex;
        gap: 40px;
        margin-bottom: 40px;

        .avatar-container {
            position: relative;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            flex-shrink: 0;
            cursor: pointer;

            .unselectable();

            .avatar {
                position: absolute;
                pointer-events: none;
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }

            .hover-shadow {
                position: absolute;
                pointer-events: none;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;

                .edit-icon {
                    pointer-events: none;
                    width: 30%;
                    height: 30%;
                    background-color: white;
                    mask: url(/img/edit.svg) no-repeat center;
                    -webkit-mask: url(/img/edit.svg) no-repeat center;
                }
            }

            &:hover .hover-shadow {
                opacity: 1;
            }
        }

        .profile-info {
            flex-grow: 1;

            h1 {
                margin-top: 0;
            }

            select {
                background-color: #333333;
                color: white;
                font-size: 12pt;
                outline: none;
                border-radius: 5px;
                padding: 3px;
                margin-left: 10px;
            }

            textarea {
                background-color: #333333;
                color: white;
                outline: none;
                resize: none;
                width: calc(100% - 20px);
                height: 70px;
                margin: 20px 0;
                border-radius: 5px;
                padding: 10px;

                &::placeholder {
                    font-style: italic;
                    color: #8a8a8a;
                }
            }
        }
    }

    .stats {
        display: table;
        width: 100%;

        .row {
            display: table-row;

            &:nth-child(odd) {
                background-color: #333333;
            }

            .name {
                display: table-cell;
                font-weight: 800;
                width: 50%;
                padding: 10px 10px;
            }

            .value {
                display: table-cell;
                padding: 10px 10px;
            }
        }
    }
</style>