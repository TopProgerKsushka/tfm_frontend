<script lang="ts">
    export let generation: number;
</script>

<div class="container">
    {#if generation > 1}
        <div class="gen">{ generation - 1 }</div>
    {/if}
    <div class="gen current">{ generation }</div>
    <div class="gen">{ generation + 1 }</div>
</div>

<style lang="less">

    @color: #8eccff;

    .container {
        display: inline-flex;
        align-items: center;
    }

    .gen {
        margin: 0 10px;
        font-family: "Digital Readout";
        padding: 0.2em 0.1em 0.05em 0.1em;
        font-size: 4vh;
        color: @color;
        text-shadow: 0 0 10px @color, 0 0 10px @color, 0 0 10px @color;
        text-align: center;
    }

    .gen.current {
        font-size: 7vh;
        text-shadow: 0 0 15px @color, 0 0 15px @color, 0 0 15px @color;

        border-top: solid 1px @color;
        border-bottom: solid 1px @color;
    }

</style>
