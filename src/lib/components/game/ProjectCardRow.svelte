<script lang="ts">
    import type { BoardCard } from "tfm_common/lib/dto/game";
    import Card from "./Card.svelte";
    export let cards: (number | BoardCard)[] = [];
    $: cardObjects = cards.map(c => typeof c === "number" ? { project: c, res: {}, gen: 0 } : c)
    export let transition: "brightnessUp" | "moveUp" = "brightnessUp";

    let clickable: boolean = false;
    let multiselect: boolean = false;
    let predicate_: (card: BoardCard) => boolean = () => true;
    let resolver: ((arg: number | PromiseLike<number>) => void) | undefined = undefined;
    let multiselectResolver: ((arg: number[] | PromiseLike<number[]>) => void) | undefined = undefined;
    let selectedProjects: number[] = [];

    export function selectCard(predicate: (card: BoardCard) => boolean): Promise<number> {
        return new Promise((resolve) => {
            predicate_ = predicate;
            resolver = resolve;
            multiselect = false;
            clickable = true;
        });
    }

    export function selectMultipleCards(predicate: (card: BoardCard) => boolean): Promise<number[]> {
        return new Promise((resolve) => {
            predicate_ = predicate;
            multiselectResolver = resolve;
            multiselect = true;
            selectedProjects = [];
            clickable = true;
        });
    }

    export function cancelSelection() {
        clickable = false;
        resolver = undefined;
    }

    function click(card: BoardCard) {
        return () => {
            if (clickable && predicate_(card)) {
                if (multiselect) {
                    const idx = selectedProjects.indexOf(card.project);
                    if (idx === -1) selectedProjects.push(card.project);
                    else selectedProjects.splice(idx, 1);
                    selectedProjects = selectedProjects;
                } else if (resolver) {
                    clickable = false;
                    resolver(card.project);
                    resolver = undefined;
                }
            }
        }
    }

    function agree() {
        if (multiselectResolver) {
            clickable = false;
            multiselectResolver(selectedProjects);
            multiselectResolver = undefined;
        }
    }
</script>

<div class="container">
    {#each cardObjects as card}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="card-container"
                on:click={click(card)}
                class:move-up={ clickable && transition === "moveUp" && predicate_(card) }
                class:brightness-up={ clickable && transition === "brightnessUp" && predicate_(card) }
                class:selected={selectedProjects.includes(card.project)}>
            <Card card={ card.project } res={ card.res } animated />
        </div>
    {/each}
    {#if clickable && multiselect}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <svg viewBox="0 0 70 70" class="check-mark" on:click={agree} class:clickable={selectedProjects.length > 0}>
            <use xlink:href="/game/img/check.svg#layer1" x="10" y="10" />
        </svg>
    {/if}
</div>

<style lang="less">
    .container {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 100%;
    }

    .card-container {
        height: 100%;

        &.move-up {
            transition-duration: 200ms;
            transition-property: transform;
            cursor: pointer;

            &:not(.selected):hover {
                transform: translateY(-10px);
            }

            &.selected {
                transform: translateY(-20px);
            }
        }

        &.brightness-up {
            transition-duration: 200ms;
            transition-property: filter;
            cursor: pointer;

            &:not(.selected):hover {
                filter: brightness(1.3);
            }

            &.selected {
                filter: brightness(1.5);
            }
        }
    }

    .check-mark {
        margin: 0 20px;
        width: 80px;
        height: 80px;

        use {
            fill: rgb(129, 129, 129);
        }

        &.clickable {

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
    }
</style>
