<script lang="ts">
    import type { GameResults, PlayerDetailsDTO } from "tfm_common/lib/dto/game";
    import UserDisplay from "../UserDisplay.svelte";

    export let players: PlayerDetailsDTO[];
    let active: boolean = false;
    let results: GameResults;

    export function showScoring(gameResults: GameResults) {
        results = gameResults;
        active = true;
    }
</script>

{#if active}
    <div class="background">
        <div class="window">
            <h1>Игра окончена</h1>
            <div class="table">
                <div class="header">
                    <div>Игрок</div>
                    <div>ПО</div>
                    <div>ELO</div>
                </div>
                {#each results.players as player}
                    <div class="player">
                        <div class="user-display">
                            <UserDisplay user={players[player.idx].user} />
                        </div>
                        <div class="vp">
                            <div class="vp-container">
                                <img class="vp-icon" src="/favicon.png" alt="победные очки" />
                                { player.vp }
                            </div>
                        </div>
                        <div class="elo" class:negative={player.eloGain < 0} class:positive={player.eloGain > 0}>
                            { (player.eloGain >= 0 ? "+" : "") + player.eloGain }
                        </div>
                    </div>
                {/each}
            </div>

            <a href="/" class="branded">НА ГЛАВНУЮ</a>
        </div>
    </div>
{/if}

<style lang="less">
    @import "/src/vars.less";
    
    .background {
        position: fixed;
        z-index: 50;
        inset: 0;
        background: #000c;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .window {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;

        width: 60vw;
        background: @background-color;
        border: double 4px @border-color;
        padding: 40px;
    }

    h1 {
        margin: 0;
    }

    .table {
        display: table;
        width: 100%;
        border: solid 3px #1b1b1b;

        .header {
            display: table-header-group;
            background-color: #1b1b1b;

            & > div {
                display: table-cell;
                font-weight: 800;
                padding-top: 15px;
                padding-bottom: 15px;

                &:nth-child(1) {
                    padding-left: 40px;
                }

                &:nth-child(2) {
                    padding-left: 10px;
                }

                &:nth-child(3) {
                    text-align: center;
                }
            }
        }

        .player {
            display: table-row;

            &:nth-child(odd) {
                background-color: #333333;
            }

            & > div {
                display: table-cell;
                padding: 5px;
                vertical-align: middle;

                &:nth-child(3) {
                    text-align: center;
                }
            }
        }
    }

    .vp-container {
        display: flex;
        align-items: center;
    }

    .vp-icon {
        height: 1.5em;
    }

    .elo {
        &.positive { color: #b5ffaf; }
        &.negative { color: #ffa3a3; }
    }

    a.branded {
        margin-top: 20px;
        font-size: 18pt;
        font-weight: 800;
    }
</style>