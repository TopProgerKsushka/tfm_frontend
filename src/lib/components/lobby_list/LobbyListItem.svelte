<script lang="ts">
    import type { LobbyListItemDTO } from "tfm_common/lib/dto/lobby";
    import UserDisplay from "../UserDisplay.svelte";
    import { slide } from "svelte/transition";

    export let lobby: LobbyListItemDTO;

    let joinForm: HTMLFormElement;
    let passwordInputShown = false;
    let password: string | undefined = undefined;

    function tryJoin() {
        if (lobby.open || passwordInputShown && password) {
            joinForm.submit();
        } else {
            passwordInputShown = true;
        }
    }
</script>

<div class="lobby">
    <div class="header">
        {#if !lobby.open}
            <div class="lock-icon"></div>
        {/if}
        <div>
            <h3>{ lobby.name }</h3>
        </div>
        <div class="space"></div>
        <form method="post" action="/lobby?/join" bind:this={joinForm}>
            <input type="hidden" name="id" value="{lobby.id}" />
            {#if passwordInputShown}
                <input type="password" name="password" transition:slide bind:value={password} placeholder="пароль" />
            {/if}
        </form>
        <div>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="javascript:" class="branded" on:click={tryJoin}>ЗАЙТИ В ЛОББИ</a>
        </div>
    </div>
    {#if lobby.open}
        <div class="member-list">
            {#each lobby.members as member}
                <div class="member">
                    <div class="icon" class:star={ member.id === lobby.owner }></div>
                    <UserDisplay user={member} />
                    <span class="elo">( { member.stats.elo } ELO )</span>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="less">
    .lobby {
        background-color: #1a1a1a;
        padding: 20px;

        .header {
            display: flex;
            align-items: center;

            .lock-icon {
                width: 22px;
                height: 20px;
                mask: url(/img/lock.svg) no-repeat center;
                -webkit-mask: url(/img/lock.svg) no-repeat center;
                mask-size: cover;
                -webkit-mask-size: cover;
                background-color: #7a7a7a;
                margin-right: 10px;
            }

            h3 {
                margin: 0;
                height: 22px;
                line-height: 22px;
            }

            input {
                text-align: center;
                margin-right: 20px;
            }

            .space {
                flex-grow: 1;
            }
        }

        .member-list {
            margin-top: 10px;
        }

        .member {
            display: flex;
            align-items: center;
            padding: 10px;

            .icon {
                width: 22px;
                height: 22px;
                margin-right: 10px;

                &.star {
                    mask: url(/img/star.svg) no-repeat center;
                    -webkit-mask: url(/img/star.svg) no-repeat center;
                    mask-size: cover;
                    -webkit-mask-size: cover;
                    background-color: #7a7a7a;
                }
            }

            .elo {
                font-size: 0.8em;
                color: #8d8d8d;
                margin-left: 10px;
            }
        }
    }
</style>