<script lang="ts">
    import type { BoardCard, PlayerDetailsDTO } from "tfm_common/lib/dto/game";
    import UserDisplay from "../UserDisplay.svelte";
    import Card from "./Card.svelte";
    import PlayerLabelTable from "./PlayerLabelTable.svelte";
    import PlayerResourceTable from "./PlayerResourceTable.svelte";
    import ProjectCardRow from "./ProjectCardRow.svelte";
    import { createEventDispatcher } from "svelte";

    export let player: PlayerDetailsDTO;
    export let idx: number;
    export let clickable: boolean = false;
    export let currentPlayer: boolean = false;
    export let passed: boolean = false;

    let cardRow: ProjectCardRow;

    export async function selectCard(predicate: (card: BoardCard) => boolean) {
        return await cardRow.selectCard(predicate);
    }

    export function cancelSelection() {
        cardRow.cancelSelection();
    }

    const dispatch = createEventDispatcher();

    function clicked() {
        dispatch("click");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container" class:clickable on:click={clicked} class:passed={passed}>
    <div class="line player-{idx}" class:current-player={currentPlayer}></div>
    <div class="content">
        <div class="board">
            <ProjectCardRow cards={player.board} transition="brightnessUp" bind:this={cardRow} />
        </div>
        <div class="player-labels-box">
            <PlayerLabelTable labels={ player.labels } />
        </div>
        <div class="player-box">
            <div class="hf">
                <div class="vf">
                    <div class="user-container">
                        <UserDisplay user={ player.user } details="left" />
                    </div>
                    <div>
                        <img class="icon" src="/game/img/tr.svg" alt="рейтинг терраформирования" />
                        { player.tr }
                    </div>
                </div>
                <div class="space"></div>
                {#if player.corporation !== undefined}
                    <div class="corp-card">
                        <Card card={ player.corporation } corp />
                    </div>
                {/if}
                <!-- <img src="/game/img/corps/{ player.corporation }.png" alt="" /> -->
            </div>
            <PlayerResourceTable resources={ player.resources } />
        </div>
    </div>
</div>

<style lang="less">
    .container {
        display: flex;
        flex-direction: column;
        background: linear-gradient(90deg, #0000, #0008 50px, #0008);
        transition-duration: 0.5s;
        transition-property: opacity;

        &.clickable {
            cursor: pointer;
            &:hover {
                background: linear-gradient(90deg, #3330, #3338 50px, #3338);
            }
        }

        &.passed {
            opacity: 60%;
        }
    }

    .line {
        height: 1px;
        transition-duration: 0.3s;
        transition-property: height;
        
        &.player-0 { background: linear-gradient(90deg, #f330, #f33); }
        &.player-1 { background: linear-gradient(90deg, #58f0, #58f); }
        &.player-2 { background: linear-gradient(90deg, #ff00, #ff0); }
        &.player-3 { background: linear-gradient(90deg, #f0f0, #f0f); }
        &.player-4 { background: linear-gradient(90deg, #0f00, #0f0); }

        &.current-player {
            height: 5px;
        }
    }

    .content {
        display: flex;
        align-items: end;
    }

    .board {
        height: 120px;
        flex: 1 0;
        overflow-y: hidden;
        overflow-x: scroll;
        scrollbar-width: 3px;
        scrollbar-color: white transparent;

        &::-webkit-scrollbar {
            height: 7px;
            width: 7px;
        }

        &::-webkit-scrollbar-track {
            background-color: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background-color: white;
            border-radius: 3px;
            border: 2px solid black;
        }
    }
    
    .player-labels-box {
        flex: 0 0;
    }

    .player-box {
        width: 200px;
        flex: 0 0;
    }

    .hf {
        display: flex;
    }

    .vf {
        display: flex;
        flex-direction: column;
    }

    .space {
        flex-grow: 1;
    }

    .corp-card {
        margin: 4px;
        height: 35px;
        border-radius: 3px;
    }

    .user-container {
        margin: 5px 0;
    }

    .icon {
        height: 1em;
    }
</style>