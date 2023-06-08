<script lang="ts">
    import Welcome from "$lib/components/Welcome.svelte";
    import LobbyList from "$lib/components/lobby_list/LobbyList.svelte";
    import { slide } from "svelte/transition";
    import type { PageData } from "./$types";

    export let data: PageData;

    let lobbyNameFilter: string = "";
    let createLobbyShown: boolean = false;
    let createLobbyForm: HTMLFormElement;
    let openLock: boolean = true;
    let lobbyName: string;

    function tryCreateLobby() {
        if (!createLobbyShown || !lobbyName) {
            createLobbyShown = true;
        } else {
            createLobbyForm.submit();
        }
        return false;
    }

    function toggleLock() {
        openLock = !openLock;
    }
</script>

{#if data.auth}
    <div class="content-pane">
        <div class="panel">
            {#if data.lobbies?.length === 0}
                <div class="nolobbies">
                    <h1>Кажется, в текущий момент нет ни одного лобби</h1>
                    {#if createLobbyShown}
                        <form method="post" action="/lobby?/create" class="create-form" transition:slide bind:this={createLobbyForm}>
                            <div class="name-line">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div class="lock-icon" class:open-lock={openLock} on:click={toggleLock}></div>
                                <input type="text" name="name" placeholder="название" bind:value={lobbyName} />
                            </div>
                            {#if !openLock}
                                <div transition:slide>
                                    <input type="text" name="password" placeholder="пароль" />
                                </div>
                            {/if}
                        </form>
                    {/if}
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a href="javascript:" class="branded" on:click={tryCreateLobby}>СОЗДАТЬ ЛОББИ</a>
                </div>
            {:else}
                <div class="header">
                    <div class="filter-box">
                        <h2>Найдите лобби</h2>
                        <input type="text" bind:value={lobbyNameFilter} />
                    </div>
                    <div class="create-box">
                        <h2>Или создайте своё</h2>
                        {#if createLobbyShown}
                            <form method="post" action="/lobby?/create" class="create-form" transition:slide bind:this={createLobbyForm}>
                                <div class="name-line">
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div class="lock-icon" class:open-lock={openLock} on:click={toggleLock}></div>
                                    <input type="text" name="name" placeholder="название" bind:value={lobbyName} />
                                </div>
                                {#if !openLock}
                                    <div transition:slide>
                                        <input type="text" name="password" placeholder="пароль" />
                                    </div>
                                {/if}
                            </form>
                        {/if}
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a href="javascript:" class="branded" on:click={tryCreateLobby}>СОЗДАТЬ ЛОББИ</a>
                    </div>
                </div>
                <div>
                    <h2>Список лобби</h2>
                    <LobbyList lobbies={(data.lobbies ?? []).filter(l => l.name.includes(lobbyNameFilter))} />
                </div>
            {/if}
        </div>
    </div>
{:else}
    <Welcome />
{/if}

<style lang="less">
    @import "/src/vars.less";

    .content-pane {
        box-sizing: border-box;
        width: 70vw;
        margin: 0 auto;
        min-height: calc(100vh - @navbar-height);
        padding: 40px;
    }

    .panel {
        background-color: @background-color;
        border: double 4px @border-color;
        padding: 40px;
    }

    .nolobbies {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        h1 {
            margin: 0 0 40px 0;
        }
    }

    .header {
        display: flex;
        gap: 40px;

        h2 {
            margin: 0 0 30px 0;
        }

        margin-bottom: 40px;
    }

    .filter-box {
        flex-grow: 1;

    }

    .create-box {
        width: 260px;

        text-align: right;
        border-left: solid 1px @border-color;
    }

    .create-form {
        display: flex;
        flex-direction: column;
        align-items: end;
        margin-bottom: 10px;

        & > * {
            margin-bottom: 10px;
        }

        .name-line {
            display: flex;
        }
    }

    .lock-icon {
        width: 20px;
        height: 20px;
        mask: url(/img/lock.svg) no-repeat center;
        -webkit-mask: url(/img/lock.svg) no-repeat center;
        mask-size: cover;
        -webkit-mask-size: cover;
        background-color: #7a7a7a;
        cursor: pointer;

        &.open-lock {
            mask: url(/img/open_lock.svg) no-repeat center;
            -webkit-mask: url(/img/open_lock.svg) no-repeat center;
            mask-size: cover;
            -webkit-mask-size: cover;
        }

        &:hover {
            background-color: #b4b4b4;
        }
    }
</style>
