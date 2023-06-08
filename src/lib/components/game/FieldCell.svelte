<script lang="ts">
    import type { FieldCellContent, FieldCellStatic } from "tfm_common/lib/field";
    import type { Tile } from "tfm_common/lib/tiles";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";

    export let cellStatic: FieldCellStatic | undefined = undefined;
    export let x: number;
    export let y: number;
    export let content: FieldCellContent;
    export let clickable: boolean = false;

    const dispatch = createEventDispatcher();

    function cellClicked() {
        if (clickable) dispatch("click");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if content}
    <image href="/game/img/tiles/{ content.type }.svg" x={x} y={y} width="20" height="20" transform="translate(-10 -10)" transition:fly={{ y: -5, duration: 500 }} />
    {#if content.type !== "ocean"}
        <image href="/game/img/player/{ content.owner }.svg" x={x} y={y} width="3.4" height="3.4" transform="translate(-1.7 -1.7)" transition:fly={{ y: -5, duration: 500, delay: 500 }} />
    {/if}
{:else}
    <g class:clickable class:ocean={cellStatic?.ocean} on:click={cellClicked}>
    <use xlink:href="#cell" x={x} y={y} class="hexagon" />
    {#if cellStatic}
        {#if cellStatic.reward}
            {#if cellStatic.reward.length >= 1}
                {#if cellStatic.reward[0].res !== "project"}
                    <image href="/game/img/res/{cellStatic.reward[0].res}.svg" x={x - 5} y={y - 5} width="4" height="4" transform="translate(-2, -2)" />
                {:else}
                    <image href="/game/img/project.png" x={x - 5} y={y - 5} width="4" transform="translate(-2 -3)" />
                {/if}
                {#if cellStatic.reward[0].amount > 1}
                    <text x={x - 4} y={y - 5} class="reward-amount">x{cellStatic.reward[0].amount}</text>
                {/if}
            {/if}
            {#if cellStatic.reward.length >= 2}
                {#if cellStatic.reward[1].res !== "project"}
                    <image href="/game/img/res/{cellStatic.reward[1].res}.svg" x={x + 2} y={y - 5} width="4" height="4" transform="translate(-2, -2)" />
                {:else}
                    <image href="/game/img/project.png" x={x + 2} y={y - 5} width="4" transform="translate(-2 -3)" />
                {/if}
                {#if cellStatic.reward[1].amount > 1}
                    <text x={x + 3} y={y - 5} class="reward-amount">x{cellStatic.reward[1].amount}</text>
                {/if}
            {/if}
        {/if}
        {#if cellStatic.specialCity}
            <use xlink:href="/game/img/city.svg#layer1" x={x} y={y - 2} transform="translate(-5 -2.5)" class="city-icon" />
        {/if}
        {#if cellStatic.specialZone}
            <foreignObject x={x} y={y + 4} width="16" height="6" transform="translate(-8 -3)" class="special-zone-name">
                <div>
                    {cellStatic.specialZone}
                </div>
            </foreignObject>
        {/if}
    {/if}
    </g>
{/if}

<style lang="less">

    @color: #ffffff;
    @ocean-color: #5d91ff40;
    @clickable-color: #ffed87;
    @hover-color: #ffffff;

    use {
        stroke: @color;
        fill: rgba(0, 0, 0, 0);
    }

    g.ocean {
        .hexagon {
            fill: @ocean-color;
        }
    }

    g.clickable {
        cursor: pointer;

        .hexagon {
            stroke: @clickable-color;
            stroke-width: 3;
        }
        .city-icon {
            fill: @clickable-color!important;
        }
        .special-zone-name > div {
            color: @clickable-color;
        }
    }

    g.clickable:hover {
        .hexagon {
            stroke: @hover-color;
        }
        .city-icon {
            fill: @hover-color!important;
        }
        .special-zone-name > div {
            color: @hover-color;
        }
    }

    .city-icon {
        fill: @color!important;
    }

    .special-zone-name {
        pointer-events: none;

        & > div {
            text-align: center;
            font-size: 2.4px;
            font-weight: 800;
            color: @color;
            pointer-events: none;
        }
    }

    .reward-amount {
        font-size: 3px;
        font-weight: 800;
        fill: white;
    }
</style>
