<script lang="ts">
    import type { GameStateDTO, PlayerDetailsDTO } from "tfm_common/lib/dto/game";

    // export let resources: ResourcesData | undefined;
    // export let hand: number[] | undefined;
    // export let corp: number | undefined;
    export let gameState: GameStateDTO;
    export let me: PlayerDetailsDTO;

    $: resources = me.resources;
    $: hand = me.hand;
    $: corp = me.corporation;

    let clickable: boolean = false;

    $: greeneryCostInPlants = corp === 6 ? 7 : 8;
    $: powerplantCost = corp === 2 ? 8 : 11;

    $: oceanTilesPlaced = gameState.field.filter(t => t !== null && t.type === "ocean").length;
    $: projectClickable = [
        clickable && (hand?.length ?? 0) > 0,
        clickable && (resources?.credits.count ?? 0) >= powerplantCost,
        clickable && (resources?.credits.count ?? 0) >= 14 && gameState.temperature < 8,
        clickable && (resources?.heat.count ?? 0) >= 8 && gameState.temperature < 8,
        clickable && (resources?.credits.count ?? 0) >= 23,
        clickable && (resources?.plants.count ?? 0) >= greeneryCostInPlants,
        clickable && (resources?.credits.count ?? 0) >= 18 && oceanTilesPlaced < 9,
        clickable && (resources?.credits.count ?? 0) >= 25,
    ];

    let resolver: ((arg: number | PromiseLike<number>) => void) | undefined = undefined;

    export async function selectStandardProject(): Promise<number> {
        return new Promise((resolve) => {
            resolver = resolve;
            clickable = true;
        });
    }

    export function cancelSelection() {
        clickable = false;
        resolver = undefined;
    }

    function click(idx: number) {
        return () => {
            // if (!clickable) return;
            // if (idx === 0 && (hand?.length ?? 0) <= 0) return;
            // if (idx === 1 && (resources?.credits.count ?? 0) < powerplantCost) return;
            // if (idx === 2 && (resources?.credits.count ?? 0) < 14) return;
            // if (idx === 3 && (resources?.heat.count ?? 0) < 8) return;
            // if (idx === 4 && (resources?.credits.count ?? 0) < 23) return;
            // if (idx === 5 && (resources?.plants.count ?? 0) < greeneryCostInPlants) return;
            // if (idx === 6 && (resources?.credits.count ?? 0) < 18) return;
            // if (idx === 7 && (resources?.credits.count ?? 0) < 25) return;
            // if (resolver) resolver(idx);
            if (projectClickable[idx] && resolver) resolver(idx);
        };
    }
</script>

<div class="container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[0] } on:click={click(0)}>
        <img class="project" src="/game/img/project.png" alt="проекты" />x
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/res/credits.svg" alt="мегакредиты" />x
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[1] } on:click={click(1)}>
        <img src="/game/img/res/credits.svg" alt="мегакредиты" />{ powerplantCost }
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <svg viewBox="0 0 10 10">
            <image href="/game/img/production.svg" x="0" y="0" width="10" height="10" />
            <image href="/game/img/res/energy.svg" x="2" y="2" width="6" height="6" />
        </svg>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[2] } on:click={click(2)}>
        <img src="/game/img/res/credits.svg" alt="мегакредиты">14
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/temperature.svg" alt="повышение температуры">+
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[3] } on:click={click(3)}>
        <img src="/game/img/res/heat.svg" alt="тепло">8
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/temperature.svg" alt="повышение температуры">+
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[4] } on:click={click(4)}>
        <img src="/game/img/res/credits.svg" alt="мегакредиты">23
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/tiles/greenery.svg" alt="жетон озеленения">
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[5] } on:click={click(5)}>
        <img src="/game/img/res/plants.svg" alt="растения">{ greeneryCostInPlants }
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/tiles/greenery.svg" alt="жетон озеленения">
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[6] } on:click={click(6)}>
        <img src="/game/img/res/credits.svg" alt="мегакредиты">18
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/tiles/ocean.svg" alt="жетон океана">
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ projectClickable[7] } on:click={click(7)}>
        <img src="/game/img/res/credits.svg" alt="мегакредиты">25
        <img class="arrow" src="/game/img/arrow.svg" alt="" />
        <img src="/game/img/tiles/city.svg" alt="жетон города">
        <svg viewBox="0 0 10 10">
            <image href="/game/img/production.svg" x="0" y="0" width="10" height="10" />
            <image href="/game/img/res/credits.svg" x="2" y="2" width="6" height="6" />
        </svg>
    </div>
</div>

<style lang="less">
    .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .entry {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #b9b9b9;
    }

    img, svg {
        height: 1.5em;
        margin: 0 3px;
    }

    .project {
        border: solid 1px white;
        border-radius: 5px;
    }
    .arrow {
        height: 0.5em;
    }
</style>