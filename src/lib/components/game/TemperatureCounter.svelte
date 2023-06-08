<script lang="ts">
    const c = "white";
    export let temperature: number;

    function color() {
        const r = 142 + (temperature + 30) * 2.973;
        const g = 204 - (temperature + 30) * 3.131;
        const b = 255 - (temperature + 30) * 4.394;
        return `rgb(${r}, ${g}, ${b})`;
    }
</script>

<div class="container">
    <span class="label">temp</span>
    <span class="temp" style="color: {color()}; text-shadow: 0 0 15px {color()}, 0 0 15px {color()}, 0 0 15px {color()};">{temperature > 0 ? "+" : "" }{ temperature }°C</span>
</div>

<style lang="less">
    @label-color: white;

    .container {
        display: inline;
        font-family: "Digital Readout";
        font-size: 4vh;
    }

    .label {
        color: @label-color;
        text-shadow: 0 0 10px @label-color, 0 0 10px @label-color, 0 0 10px @label-color;
        margin-right: 10px;
    }

    .temp {
        font-size: 7vh;
    }
</style>
