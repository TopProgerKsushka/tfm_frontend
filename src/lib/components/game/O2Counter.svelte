<script lang="ts">
    const c = "white";
    export let o2: number;
</script>

<div class="container">
    <span class="label">O<sub>2</sub></span>
    <span class="o2">{ o2 }%</span>
</div>

<style lang="less">
    @label-color: white;
    @o2-color: white;

    .container {
        display: inline;
        font-family: "Digital Readout";
        font-size: 4vh;
    }

    .label {
        text-shadow: 0 0 10px @label-color, 0 0 10px @label-color, 0 0 10px @label-color;
        margin-right: 10px;
    }

    sub {
        font-size: 3vh;
    }

    .o2 {
        text-shadow: 0 0 15px @o2-color, 0 0 15px @o2-color, 0 0 15px @o2-color;
        font-size: 7vh;
    }
</style>
