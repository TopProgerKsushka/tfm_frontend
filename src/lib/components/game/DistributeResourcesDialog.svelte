<script lang="ts">
    import type { ResourceName } from "tfm_common/lib/string_types";
    import type { DistributeResourcesInput as Input, DistributeResourcesOutput as Output } from "tfm_common/lib/client_functions";
    import type { PlayerDetailsDTO } from "tfm_common/lib/dto/game";

    type Value = {
        cost: number,
        max: number,
        amount: number,
    };

    type ResValues = Partial<Omit<Record<ResourceName, Value>, "credits" > >;
    
    export let me: PlayerDetailsDTO;

    let resolver: ((arg: Output | PromiseLike<Output>) => void) | undefined = undefined;

    let active: boolean = false;
    let resources: ResValues = {};
    let price_ = 0;
    $: calculatedCreditsPrice = Math.max(0, price_ - Object.values(resources).map(r => r.cost * r.amount).reduce((ps, a) => ps + a, 0));

    export async function distributeResources(price: number, res: Input): Promise<Output> {
        return new Promise((resolve) => {
            price_ = price;
            resources = {};
            for (const [name, val] of Object.entries(res)) {
                resources[name as keyof ResValues] = { cost: val, max: me.resources![name as ResourceName].count, amount: 0 };
            }
            resolver = resolve;
            active = true;
        });
    }

    function ok() {
        if (resolver) {
            active = false;
            let ret: Output = {};
            ret.credits = calculatedCreditsPrice;
            for (const [name, val] of Object.entries(resources)) {
                ret[name as keyof Output] = val.amount;
            }
            resolver(ret);
            resolver = undefined;
        }
    }

    function arrange(resName: string) {
        return () => {
            while (true) {
                const fullResourcesCost = Object.values(resources).map(r => r.cost * r.amount).reduce((ps, a) => ps + a, 0);
                const delta = fullResourcesCost - price_;
                const deltaResources = Object.entries(resources).filter(([n, v]) => v.amount > 0 && v.cost <= delta);
                if (deltaResources.length === 0) break;

                let res: string = "";
                let resCost = 0;
                for (const [name, val] of deltaResources) {
                    if (name !== resName && val.cost > resCost) {
                        resCost = val.cost;
                        res = name;
                    }
                }
                if (res === "") {
                    resCost = Number.MAX_SAFE_INTEGER;
                    for (const [name, val] of Object.entries(resources)) {
                        if (name !== resName && val.amount > 0 && val.cost < resCost) {
                            resCost = val.cost;
                            res = name;
                        }
                    }
                }
                resources[res as keyof ResValues]!.amount--;
            }
        };
    }
</script>

{#if active}
    <div class="background">
        <h1>Распределите ресурсы</h1>
        <div class="res">
            <img src="/game/img/res/credits.svg" alt="мегакредиты" />
            <span class="value">{ calculatedCreditsPrice } / { me.resources?.credits.count }</span>
        </div>
        <div class="resources">
            {#each Object.entries(resources) as [name, value]}
                <div class="res">
                    <img src="/game/img/res/{name}.svg" alt={name} />
                    <input type="range" min="0" max={Math.min(value.max, Math.ceil(price_ / value.cost))} bind:value={value.amount} on:input={arrange(name)} />
                    <span class="value">{ value.amount } / { value.max }</span>
                </div>
            {/each}
        </div>
        <!-- svelte-ignore a11y-invalid-attribute -->
        {#if (me.resources?.credits.count ?? 0) >= calculatedCreditsPrice }
            <a class="branded big" href="javascript:" on:click={ok}>ПРИНЯТЬ</a>
        {:else}
            <span class="disallowed big">НЕДОСТАТОЧНО СРЕДСТВ</span>
        {/if}
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

    .resources {
        display: flex;
        flex-direction: column;
        align-items: start;

        gap: 20px;
    }

    .res {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 20px;
    }

    .value {
        font-size: 25pt;
    }

    input {
        -webkit-appearance: none;
        background: transparent;
        width: 30vw;

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

    .big {
        margin-top: 20px;
        font-size: 40px;

        &.disallowed {
            color: #c44c4c;
        }
    }
</style>