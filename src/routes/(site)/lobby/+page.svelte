<script lang="ts">
    import UserDisplay from "$lib/components/UserDisplay.svelte";
    import { LongPollClient } from "$lib/utils/api";
    import { onMount } from "svelte";
    import type { ActionData, PageData } from "./$types";
    import { errMsg } from "$lib/utils/error_messages";

    export let data: PageData;
    export let form: ActionData;

    let message = data.message ?? form?.message;

    let createGameForm: HTMLFormElement;
    let disbandForm: HTMLFormElement;
    let leaveForm: HTMLFormElement;

    function kick(id: string) {
        return () => {
            const form = document.getElementById("kickForm" + id) as HTMLFormElement;
            form.submit();
            return false;
        };
    }

    function changeOwner(id: string) {
        return () => {
            const form = document.getElementById("changeOwnerForm" + id) as HTMLFormElement;
            form.submit();
            return false;
        };
    }

    function createGame() {
        createGameForm.submit();
        return false;
    }

    function disband() {
        disbandForm.submit();
        return false;
    }

    function leave() {
        leaveForm.submit();
        return false;
    }

    onMount(async () => {
        if (data.token && data.lobbyDetails) {
            const lpc = new LongPollClient(data.token, "/lobby/events", { id: data.lobbyDetails.id });
            lpc.on("user_joined", (evt) => {
                data.lobbyDetails?.members.push(evt.user);
                data.lobbyDetails = data.lobbyDetails;
            });

            lpc.on("lobby_disbanded", () => {
                lpc.stop();
                location.href = "/";
            });

            lpc.on("user_left", (evt) => {
                const idx = data.lobbyDetails?.members.findIndex(u => u.id === evt.userId);
                if (idx !== undefined) {
                    data.lobbyDetails?.members.splice(idx, 1);
                    data.lobbyDetails = data.lobbyDetails;
                }
            });

            lpc.on("user_kicked", (evt) => {
                if (data.auth?.id === evt.userId) {
                    lpc.stop();
                    location.href = "/";
                } else {
                    const idx = data.lobbyDetails?.members.findIndex(u => u.id === evt.userId);
                    if (idx !== undefined) {
                        data.lobbyDetails?.members.splice(idx, 1);
                        data.lobbyDetails = data.lobbyDetails;
                    }
                }
            });

            lpc.on("owner_changed", (evt) => {
                data.lobbyDetails!.owner = evt.newOwnerId;
            });

            lpc.on("game_started", (evt) => {
                lpc.stop();
                location.href = `/game?id=${evt.gameId}`;
            });

            lpc.onError((code) => {
                message = "Long Poll: " + errMsg(code);
            });

            lpc.start(data.lobbyDetails.ei);
        }
    });
</script>

<div class="content-pane">
    <div class="panel">
        {#if message}
        <div class="error-message">
            {message}
        </div>
        {/if}
        {#if data.lobbyDetails}
            <h1>{ data.lobbyDetails.name }</h1>
            <div class="members">
                <div class="header">
                    <div></div>
                    <div class="shrink">Игрок</div>
                    <div class="shrink center">Побед / Игр</div>
                    <div class="shrink center">ELO</div>
                    {#if data.lobbyDetails.owner === data.auth?.id}
                        <div class="shrink center sep-left">Действия</div>
                    {/if}
                </div>
                {#each data.lobbyDetails.members as member}
                    <div class="member">
                        <div class="icon" class:owner={ member.id === data.lobbyDetails.owner }></div>
                        <div class="expand"><UserDisplay user={member} details="right" /></div>
                        <div class="shrink center">{ member.stats.gamesWon } / { member.stats.gamesPlayed }</div>
                        <div class="shrink center">{ member.stats.elo }</div>
                        {#if data.lobbyDetails.owner === data.auth?.id && member.id !== data.auth.id}
                            <div class="shrink sep-left">
                                <form id={"kickForm" + member.id} method="post" action="?/kick">
                                    <input type="hidden" name="userId" value={member.id} />
                                    <input type="hidden" name="id" value={data.lobbyDetails.id} />
                                </form>
                                <form id={"changeOwnerForm" + member.id} method="post" action="?/changeOwner">
                                    <input type="hidden" name="newOwnerId" value={member.id} />
                                    <input type="hidden" name="id" value={data.lobbyDetails.id} />
                                </form>
                                <div class="actions">
                                    <!-- svelte-ignore a11y-invalid-attribute -->
                                    <a href="javascript:" class="branded" on:click={kick(member.id)}>исключить</a>
                                    <!-- svelte-ignore a11y-invalid-attribute -->
                                    <a href="javascript:" class="branded" on:click={changeOwner(member.id)}>передать владельца</a>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="button-pane">
                {#if data.lobbyDetails.owner === data.auth?.id}
                    {#if data.lobbyDetails.members.length >= 2 && data.lobbyDetails.members.length <= 5}
                        <form method="post" action="/game?/create" bind:this={createGameForm}>
                            <input type="hidden" name="lobbyId" value={data.lobbyDetails.id} />
                        </form>
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a href="javascript:" class="branded" on:click={createGame}>НАЧАТЬ ИГРУ</a>
                    {/if}
                    <form method="post" action="?/disband" bind:this={disbandForm}>
                        <input type="hidden" name="lobbyId" value={data.lobbyDetails.id} />
                    </form>
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a href="javascript:" class="branded" on:click={disband}>РАСФОРМИРОВАТЬ ЛОББИ</a>
                {/if}
                <form method="post" action="?/leave" bind:this={leaveForm}>
                </form>
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a href="javascript:" class="branded" on:click={leave}>ПОКИНУТЬ ЛОББИ</a>
            </div>
        {/if}
    </div>
</div>

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

    h1 {
        margin: 0 0 30px 0;
    }

    .members {
        display: table;
        width: 100%;
        margin-bottom: 30px;

        .header {
            display: table-header-group;
            font-weight: 800;
            background-color: #1b1b1b;
            height: 40px;

            & > div {
                display: table-cell;
                vertical-align: middle;
                padding: 5px 10px;
            }
        }

        .member {
            display: table-row;

            & > div {
                display: table-cell;
                vertical-align: middle;
                padding: 5px 10px;
            }

            &:nth-child(odd) {
                background-color: #333333;
            }
        }

        .expand {
            width: 60%;
        }

        .shrink {
            white-space: nowrap;
        }

        .center {
            text-align: center;
        }

        .sep-left {
            border-left: solid 5px @background-color;
        }
    }

    .icon {
        width: 40px;

        &.owner {
            mask: url(/img/star.svg) no-repeat center;
            -webkit-mask: url(/img/star.svg) no-repeat center;
            mask-size: contain;
            -webkit-mask-size: contain;
            background-color: #7a7a7a;
        }
    }

    .actions {
        display: flex;
        gap: 30px;
    }

    .button-pane {
        display: flex;
        gap: 30px;
        justify-content: end;
    }
</style>
