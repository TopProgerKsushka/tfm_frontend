<script lang="ts">
    import type { Choice } from "tfm_common/lib/client_functions";

    let active: boolean = false;
    let variants: Choice[] = [];

    let resolver: (result: string | PromiseLike<string>) => void;

    export function makeChoice(choiceVariants: Choice[]): Promise<string> {
        return new Promise((resolve) => {
            variants = choiceVariants;
            active = true;
            resolver = resolve;
        });
    }

    function choose(result: string) {
        return () => {
            resolver(result);
            active = false;
        };
    }
</script>

{#if active}
    <div class="background">
        <h1>Что Вы выберете?</h1>
        <div class="variants">
            {#each variants as variant}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a class="branded" href="javascript:" on:click={choose(variant.result)}>
                    <div class="variant">
                        {#if variant.picture}
                            <svg viewBox="0 0 { variant.picture.length * 10 + (variant.picture.length - 1) * 3 } 10">
                                {#each variant.picture as icon, idx}
                                    {#if icon === "arrow"}
                                        <image href="/game/img/arrow.svg" x={idx * 13} y="0" width="10" height="10" />
                                    {:else}
                                        {#if icon.type === "res"}
                                            {#if icon.production}
                                                <image href="/game/img/production.svg" x={idx * 13} y="0" width="10" height="10" />
                                                <image href="/game/img/res/{ icon.res }.svg" x={idx * 13 + 1} y="1" width="8" height="8" />
                                            {:else}
                                                <image href="/game/img/res/{ icon.res }.svg" x={idx * 13} y="0" width="10" height="10" />
                                            {/if}
                                            {#if icon.star}
                                                <text x={idx * 13 + 8} y="3.3">*</text>
                                            {/if}
                                            {#if icon.count !== undefined}
                                                <text x={idx * 13 + 5.2} y="9.5">x{ icon.count }</text>
                                            {/if}
                                        {:else}
                                            <image href="/game/img/{ icon.parameter }.svg" x={idx * 13} y="0" width="10" height="10" />
                                        {/if}
                                    {/if}
                                {/each}
                            </svg>
                        {/if}
                        {variant.text}
                    </div>
                </a>
            {/each}
        </div>
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
    }

    h1 {
        margin: 0 0 40px 0;
    }

    text {
        font: bold 4px sans-serif;
        fill: white;
        stroke: black;
        stroke-width: 0.1px;
    }

    .variants {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3vw;
    }

    a {
        font-size: 20pt;
    }

    .variant {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        svg {
            width: 20vw;
            height: 20vh;
        }
    }
</style>
