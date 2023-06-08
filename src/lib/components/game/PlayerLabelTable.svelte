<script lang="ts">
    import type { LabelsData } from "tfm_common/lib/dto/game";

    export let labels: LabelsData;
</script>

<div class="grid">
    {#each Object.entries(labels) as [labelName, count]}
        <div>
            <img src="/game/img/labels/{ labelName }.svg" alt={labelName} />
        </div>
        <div class="count">
            { count }
        </div>
    {/each}
</div>

<style lang="less">
    .grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: auto 20px auto 20px;
        column-gap: 5px;
    }

    img {
        height: 1.2em;
    }
</style>
