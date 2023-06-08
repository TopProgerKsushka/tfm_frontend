<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { tick } from "svelte/internal";
    import { fade } from "svelte/transition";
    import type { PlayerDetailsDTO } from "tfm_common/lib/dto/game";
    import type { GameEvent } from "tfm_common/lib/events/game";
    import type { AwardName, MilestoneName } from "tfm_common/lib/string_types";
    import ProjectDisplay from "./ProjectDisplay.svelte";

    export let players: PlayerDetailsDTO[];

    let open_ = false;
    let events: GameEvent[] = [];

    let window: HTMLElement;
    let savedScrollTop: number | "bottom" = 0;

    const dispatch = createEventDispatcher();

    function clicked() {
        if (open_) close();
        else open();

        if (open_) {
            dispatch("open");
        } else {
            dispatch("close");
        }
    }

    export function isOpen() { return open_; }
    export function open() {
        if (!open_) {
            open_ = true;
            triggerScroll();
        }
    }
    export function close() {
        if (open_) {
            savedScrollTop = window.scrollTop;
            open_ = false;
        }
    }

    export function addEvent(event: GameEvent) {
        events.push(event);
        events = events;
        savedScrollTop = "bottom";
        triggerScroll();
    }

    async function triggerScroll() {
        await tick();
        window.scrollTop = savedScrollTop === "bottom" ? window.scrollHeight : savedScrollTop;
    }

    function awardName(award: AwardName) {
        if (award === "landlord") return "Собственник";
        if (award === "banker") return "Банкир";
        if (award === "scientist") return "Учёный";
        if (award === "thermalist") return "Теплотехник";
        if (award === "miner") return "Шатхёр";
        return "???";
    }

    function milesoneName(milestone: MilestoneName) {
        if (milestone === "terraformer") return "Колонизатор";
        if (milestone === "mayor") return "Мэр";
        if (milestone === "gardener") return "Садовод";
        if (milestone === "builder") return "Строитель";
        if (milestone === "planner") return "Стратег";
        return "???";
    }
    
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
    <svg viewBox="0 0 70 70" class="hand-button" on:click={clicked}>
        <use xlink:href="/game/img/events.svg#layer1" x="10" y="10" />
    </svg>
    {#if open_}
        <div class="window" bind:this={window} transition:fade>
            {#each events as event}
                <div class="event-box">
                    {#if event.type === "phase_changed"}
                        Наступила { event.data.phase === "action" ? "фаза действий" : "фаза исследования" }.
                        {#if event.data.phase === "action"}
                            Первым ходит <b class="player-{event.data.turn}">{ players[event.data.turn].user.username }</b>.
                        {/if}
                    {:else if event.type === "turn_changed"}
                        Ход переходит к <b class="player-{event.data.turn}">{ players[event.data.turn].user.username }</b>.
                    {:else if event.type === "generation_changed"}
                        Наступило поколение <b>{ event.data.gen }</b>.
                    {:else if event.type === "player_passed"}
                        <b class="player-{event.data.player}">{ players[event.data.player].user.username }</b>
                        {#if players[event.data.player].user.personal.sex === "female"}
                            пропустила
                        {:else}
                            пропустил
                        {/if}
                        ход.
                    {:else if event.type === "player_skipped_action"}
                        <b class="player-{event.data.player}">{ players[event.data.player].user.username }</b>
                        {#if players[event.data.player].user.personal.sex === "female"}
                            отказалась
                        {:else}
                            отказался
                        {/if}
                        от выполнения второго действия.
                    {:else if event.type === "action"}
                        <b class="player-{event.data.player}">{ players[event.data.player].user.username }</b>
                        {#if event.data.action === "award"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                учредила
                            {:else}
                                учредил
                            {/if}
                            награду «{awardName(event.data.award)}».
                        {:else if event.data.action === "milestone"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                заявила
                            {:else}
                                заявил
                            {/if}
                            о достижении «{milesoneName(event.data.milestone)}».
                        {:else if event.data.action === "standard_project"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                выполнила
                            {:else}
                                выполнил
                            {/if}
                            стандартный проект:
                            {#if event.data.standardProjectIdx === 0}
                                продажа патентов.
                            {:else if event.data.standardProjectIdx === 1}
                                электростанция.
                            {:else if event.data.standardProjectIdx === 2}
                                астероид.
                            {:else if event.data.standardProjectIdx === 3}
                                повышение температуры за счёт тепла.
                            {:else if event.data.standardProjectIdx === 4}
                                озеленение.
                            {:else if event.data.standardProjectIdx === 5}
                                озеленение за счёт растений.
                            {:else if event.data.standardProjectIdx === 6}
                                аквифер.
                            {:else if event.data.standardProjectIdx === 7}
                                город.
                            {:else}
                                ???
                            {/if}
                        {:else if event.data.action === "hand_play"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                сыграла
                            {:else}
                                сыграл
                            {/if}
                            с руки карту проекта <ProjectDisplay project={event.data.project} />.
                            <!-- <b class="{PROJECT_STATIC[event.data.project].type}-project">{PROJECT_STATIC[event.data.project].name}</b>. -->
                        {:else if event.data.action === "project_action"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                выполнила
                            {:else}
                                выполнил
                            {/if}
                            действие проекта <ProjectDisplay project={event.data.project} />
                            <!-- <b class="{PROJECT_STATIC[event.data.project].type}-project">{PROJECT_STATIC[event.data.project].name}</b>. -->
                        {:else if event.data.action === "unmi"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                выполнила
                            {:else}
                                выполнил
                            {/if}
                            действие корпорации <b>UNMI</b>.
                        {:else if event.data.action === "inventrix"}
                            {#if players[event.data.player].user.personal.sex === "female"}
                                взяла
                            {:else}
                                взял
                            {/if}
                            3 карты проектов в качестве первого действия корпорации <b>Inventrix</b>.
                        {:else if event.data.action === "tharsis"}
                                {#if players[event.data.player].user.personal.sex === "female"}
                                    выложила
                                {:else}
                                    выложил
                                {/if}
                            жетон города в качестве первого действия корпорации <b>Фарсидская республика</b>.
                        {/if}
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="less">
    @import "/src/vars.less";

    .container {
        position: relative;
    }

    .hand-button {
        margin: 0 20px;
        width: 80px;
        height: 80px;

        .unselectable();

        cursor: pointer;

        use {
            fill: white;
        }

        &:hover {
            use {
                filter: drop-shadow(0 0 10px white);
            }
        }
    }

    .window {
        position: absolute;
        bottom: 100px;
        right: 0px;
        z-index: 10;
        
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;

        width: 300px;
        height: 70vh;
        background: #000c;
        border-radius: 20px;

        padding: 10px;

        overflow-y: auto;
    }

    .event-box {
        padding: 10px;
        background: #000c;
        border-radius: 10px;
        border: solid 1px #555c;
    }

    b {
        &.player-0 { color: #f33; }
        &.player-1 { color: #58f; }
        &.player-2 { color: #ff0; }
        &.player-3 { color: #f0f; }
        &.player-4 { color: #0f0; }

        &.active-project { color: #427afd; }
        &.automated-project { color: #00d800; }
        &.event-project { color: #fa0d0d; }
    }
</style>
