<script lang="ts">
    import type { FieldContents } from "tfm_common/lib/field";
    import type { MilestoneName } from "tfm_common/lib/string_types";
    import type { MilestonesData, PlayerDetailsDTO } from "tfm_common/lib/dto/game";
    import { fly } from "svelte/transition";

    export let milestones: MilestonesData;
    export let me: PlayerDetailsDTO;
    export let field: FieldContents;

    let clickable: boolean = false;

    $: milestonesClickable = clickable && Object.keys(milestones).length < 3 && (me.resources?.credits.count ?? 0) >= 8;

    $: terraformerClickable = milestonesClickable && milestones.terraformer === undefined && me.tr >= 35;
    $: mayorClickable = milestonesClickable && milestones.mayor === undefined && field.filter((c =>
        c !== null && c.type === "city" && c.owner === me.idx
    )).length >= 3;
    $: gardenerClickable = milestonesClickable && milestones.gardener === undefined && field.filter((c =>
        c !== null && c.type === "greenery" && c.owner === me.idx
    )).length >= 3;
    $: builderClickable = milestonesClickable && milestones.builder === undefined && me.labels.building >= 8;
    $: plannerClickable = milestonesClickable && milestones.planner === undefined && (me.hand?.length ?? 0) >= 16;

    let resolver: ((arg: MilestoneName | PromiseLike<MilestoneName>) => void) | undefined = undefined;

    export async function selectMilestone(): Promise<MilestoneName> {
        return new Promise((resolve) => {
            resolver = resolve;
            clickable = true;
        });
    }

    export function cancelSelection() {
        clickable = false;
        resolver = undefined;
    }

    function click(milestone: MilestoneName) {
        return () => {
            if (resolver) {
                if (
                    milestone === "terraformer" && terraformerClickable ||
                    milestone === "mayor" && mayorClickable ||
                    milestone === "gardener" && gardenerClickable ||
                    milestone === "builder" && builderClickable ||
                    milestone === "planner" && plannerClickable
                ) {
                    clickable = false;
                    resolver(milestone);
                    resolver = undefined;
                }
            }
        };
    }

</script>

<div class="container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ terraformerClickable } on:click={click("terraformer")}>
        <div class="content">
            35
            <img src="/game/img/tr.svg" alt="рейтинг терраформирования" />
            {#if milestones.terraformer !== undefined}
                <img src="/game/img/player/{ milestones.terraformer }.svg" alt="Игрок { milestones.terraformer }" transition:fly={{ y: -30, duration: 300 }} />
            {/if}
        </div>
        <div class="name orange-bg">
            КОЛОНИЗАТОР
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ mayorClickable } on:click={click("mayor")}>
        <div class="content">
            3
            <img src="/game/img/tiles/city.svg" alt="жетона города" />
            {#if milestones.mayor !== undefined}
                <img src="/game/img/player/{ milestones.mayor }.svg" alt="Игрок { milestones.mayor }" transition:fly={{ y: -30, duration: 300 }} />
            {/if}
        </div>
        <div class="name gray-bg">
            МЭР
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ gardenerClickable } on:click={click("gardener")}>
        <div class="content">
            3
            <img src="/game/img/tiles/greenery.svg" alt="жетона озеленения" />
            {#if milestones.gardener !== undefined}
                <img src="/game/img/player/{ milestones.gardener }.svg" alt="Игрок { milestones.gardener }" transition:fly={{ y: -30, duration: 300 }} />
            {/if}
        </div>
        <div class="name green-bg">
            САДОВОД
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:branded={ builderClickable } on:click={click("builder")}>
        <div class="content">
            8
            <img src="/game/img/labels/building.svg" alt="меток строений" />
            {#if milestones.builder !== undefined}
                <img src="/game/img/player/{ milestones.builder }.svg" alt="Игрок { milestones.builder }" transition:fly={{ y: -30, duration: 300 }} />
            {/if}
        </div>
        <div class="name brown-bg">
            СТРОИТЕЛЬ
        </div>
    </div>
    <div class="entry">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="content" class:branded={ plannerClickable } on:click={click("planner")}>
            16
            <img class="project" src="/game/img/project.png" alt="карт проектов" />
            {#if milestones.planner !== undefined}
                <img src="/game/img/player/{ milestones.planner }.svg" alt="Игрок { milestones.planner }" transition:fly={{ y: -30, duration: 300 }} />
            {/if}
        </div>
        <div class="name blue-bg">
            СТРАТЕГ
        </div>
    </div>
</div>

<style lang="less">
    @gap: 10px;

    .container {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: @gap;
        width: 300px;

        .entry {
            width: calc(50% - @gap);
            font-weight: 800;
            color: #b9b9b9;
        }
    }

    img {
        height: 1.5em;

        &.project {
            border: solid 1px white;
            border-radius: 5px;
        }
    }

    .name {
        text-align: center;
        font-size: 10pt;
        border: solid 1px white;

        &.orange-bg { background: #d65804; }
        &.gray-bg { background: #838383; }
        &.green-bg { background: #00b900; }
        &.brown-bg { background: #924008; }
        &.blue-bg { background: #004db1; }
    }
</style>
