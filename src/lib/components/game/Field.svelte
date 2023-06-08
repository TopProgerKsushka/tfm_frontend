<script lang="ts">
    import { FIELD_CELL_STATIC, type FieldContents } from "tfm_common/lib/field";
    import { cellPos } from "$lib/utils/cellpos";
    import FieldCell from "./FieldCell.svelte";

    type FieldPredicate = (idx: number) => boolean;

    export let contents: FieldContents;

    let clickableCells: number[] = [];

    let resolver: (value: number | PromiseLike<number>) => void;

    export async function placeTile(predicate: FieldPredicate): Promise<number> {
        return new Promise((resolve) => {
            const clickableCells_ = [];
            for (let idx = 0; idx < 63; ++idx) {
                if (predicate(idx)) {
                    clickableCells_.push(idx);
                }
            }
            clickableCells = clickableCells_;
            resolver = resolve;
        });
    }

    function cellClicked(idx: number) {
        return () => {
            resolver(idx);
            clickableCells = [];
        };
    }
    
</script>

<svg viewBox="0 0 210 180">
    <defs>
        <polygon
            id="cell"
            
            vector-effect="non-scaling-stroke"
            points="0,-10 9,-5 9,5 0,10 -9,5 -9,-5"
            />
    </defs>

    <!-- <rect width="100%" height="100%" stroke="red" fill="none" /> -->

    <image class="jupiter-bg" href="/game/img/jupiter.png" x="10" y="80" width="10" height="10" transform="translate(-5 -5)" />
    <circle cx="20" cy="65" r="5" fill="white" style="filter: blur(5px);" />
    <image class="phobos-bg" href="/game/img/phobos.png" x="30" y="20"  width="20" height="20" transform="translate(-10 -10)" />
    <image class="mars-bg" href="/game/img/mars.png" x="120" y="90" width="166" height="166" transform="translate(-83 -83)" />

    {#each [...Array(63).keys()] as i}
        <FieldCell
            x={cellPos.x(i)} y={cellPos.y(i)}
            cellStatic={FIELD_CELL_STATIC[i]}
            content={contents[i]}
            on:click={cellClicked(i)}
            clickable={ clickableCells.includes(i) }
            />
    {/each}

</svg>

<style lang="less">

    svg {
        width: 100%;
        height: 100%;
    }

    .jupiter-bg {
        filter: drop-shadow(0 0 1px white);
    }

    .mars-bg {
        filter: drop-shadow(0 0 5px red);
    }

    .phobos-bg {
        filter: drop-shadow(0 0 2px #b4b4b4);
    }
</style>
