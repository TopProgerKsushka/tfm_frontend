<script lang="ts">
    let active: boolean = false;
    let title: string;
    let min: number;
    let max: number;
    let value: number;

    let resolver: (result: number | PromiseLike<number>) => void;

    export function numberBetween(question: string, a: number, b: number): Promise<number> {
        return new Promise((resolve) => {
            min = a;
            value = a;
            max = b;
            title = question;
            active = true;
            resolver = resolve;
        });
    }

    function ok() {
        active = false;
        resolver(value);
    }
</script>

{#if active}
    <div class="background">
        <h1>{title}</h1>
        <input type="range" min={min} max={max} bind:value />
        <span class="value">{value}</span>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a class="branded" href="javascript:" on:click={ok}>ПРИНЯТЬ</a>
    </div>
{/if}

<style lang="less">
    .background {
        position: fixed;
        z-index: 50;
        inset: 0;
        background: #000c;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3vh;
    }

    h1 {
        margin: 0 0 40px 0;
    }

    .value {
        font-size: 25pt;
    }

    input {
        -webkit-appearance: none;
        width: 70vw;
        background: transparent;

        cursor: grab;

        &:active {
            cursor: grabbing;
        }

        &::-webkit-slider-runnable-track {
            height: 4px;
            background: white;
        }

        &::-moz-range-track {
            width: 100%;
            height: 4px;
            background: white;
        }

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 30px;
            height: 30px;
            background-color: white;
            border-radius: 50%;
            margin-top: -13px;
        }

        &::-moz-range-thumb {
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
        }
    }

    a {
        margin-top: 20px;
        font-size: 40px;
    }
</style>
