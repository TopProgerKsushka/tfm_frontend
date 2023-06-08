<script lang="ts">
    import type { AwardName } from "tfm_common/lib/string_types";
    import type { PlayerDetailsDTO } from "tfm_common/lib/dto/game";

    export let awards: AwardName[];
    export let awardPrice: number | undefined;
    export let me: PlayerDetailsDTO;

    let clickable: boolean = false;

    $: awardsClickable = clickable && awards.length < 3 && (me.resources?.credits.count ?? 0) >= (awardPrice ?? 999999);

    $: landlordClickable = awardsClickable && !awards.includes("landlord");
    $: bankerClickable = awardsClickable && !awards.includes("banker");
    $: scientistClickable = awardsClickable && !awards.includes("scientist");
    $: thermalistClickable = awardsClickable && !awards.includes("thermalist");
    $: minerClickable = awardsClickable && !awards.includes("miner");

    let resolver: ((arg: AwardName | PromiseLike<AwardName>) => void) | undefined = undefined;

    export async function selectAward(): Promise<AwardName> {
        return new Promise((resolve) => {
            resolver = resolve;
            clickable = true;
        });
    }

    export function cancelSelection() {
        clickable = false;
        resolver = undefined;
    }

    function click(award: AwardName) {
        return () => {
            if (resolver) {
                if (
                    award === "landlord" && landlordClickable ||
                    award === "banker" && bankerClickable ||
                    award === "scientist" && scientistClickable ||
                    award === "thermalist" && thermalistClickable ||
                    award === "miner" && minerClickable
                ) {
                    clickable = false;
                    resolver(award);
                    resolver = undefined;
                }
            }
        };
    }
</script>

<div class="container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:active={awards.includes("landlord")} class:branded={ landlordClickable } on:click={click("landlord")}>
        <div class="content">
            <img src="/game/img/tiles/any.svg" alt="наибольшее количество жетонов на поле" />
        </div>
        <div class="name">
            СОБСТВЕННИК
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:active={awards.includes("banker")} class:branded={ bankerClickable } on:click={click("banker")}>
        <div class="content">
            <svg viewBox="0 0 10 10">
                <image href="/game/img/production.svg" x="0" y="0" width="10" height="10" />
                <image href="/game/img/res/credits.svg" x="2" y="2" width="6" height="6" />
            </svg>
        </div>
        <div class="name">
            БАНКИР
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:active={awards.includes("scientist")} class:branded={ scientistClickable } on:click={click("scientist")}>
        <div class="content">
            <img src="/game/img/labels/science.svg" alt="наибольшее количество меток открытий" />
        </div>
        <div class="name">
            УЧЁНЫЙ
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:active={awards.includes("thermalist")} class:branded={ thermalistClickable } on:click={click("thermalist")}>
        <div class="content">
            <img src="/game/img/res/heat.svg" alt="наибольшее количество тепла" />
        </div>
        <div class="name">
            ТЕПЛОТЕХНИК
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="entry" class:active={awards.includes("miner")} class:branded={ minerClickable } on:click={click("miner")}>
        <div class="content">
            <img src="/game/img/res/steel.svg" alt="сталь" />
            <img src="/game/img/res/titanium.svg" alt="титан" />
        </div>
        <div class="name">
            ШАХТЁР
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

            opacity: 50%;

            &.active {
                opacity: 100%;
            }

            &.branded:hover {
                opacity: 70%;
            }
        }
    }

    img, svg {
        height: 1.5em;
    }

    .name {
        text-align: center;
        font-size: 10pt;
        border: solid 1px white;

        background: #927f15;
        color: white!important;
    }
</style>
