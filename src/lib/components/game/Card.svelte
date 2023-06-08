<script lang="ts">
    import type { CardResourcesData } from "tfm_common/lib/dto/game";
    import { fly } from "svelte/transition";

    export let card: number;
    export let res: CardResourcesData = {};
    export let corp: boolean = false;
    export let animated: boolean = false;

    $: path = `/game/img/${ corp ? "corps" : "projects" }/${card}.png`;

    let cardImg: HTMLImageElement;

    let timeout: any | undefined = undefined;
    let popup: HTMLElement | undefined = undefined;

    function mouseEnter() {
        timeout = setTimeout(showPopup, 500);
    }

    function mouseLeave() {
        if (timeout !== undefined) clearTimeout(timeout);
        hidePopup();
    }

    function showPopup() {
        const padding = 10;

        const rect = cardImg.getBoundingClientRect();
        const h = Math.floor(window.innerHeight * 0.4);
        const w = Math.floor((h / cardImg.naturalHeight) * cardImg.naturalWidth);

        const x =
            rect.x + w + padding * 2 < window.innerWidth
            ? rect.x
            : rect.x + rect.width - (w + padding * 2);
        
        const y =
            rect.y - h - padding * 2 < 0
            ? rect.y + rect.height + padding - 5
            : rect.y - h - padding * 2 - 5;

        popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.zIndex = "2";
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        popup.style.padding = `${padding}px`;
        popup.style.background = "#0008";
        popup.style.borderRadius = `5%`;

        const img = document.createElement("img");
        img.src = path;
        img.style.borderRadius = "5%";
        img.style.height = `${h}px`;
        popup.append(img);

        document.body.append(popup);
    }

    function hidePopup() {
        popup?.remove();
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container" on:mouseenter={mouseEnter} on:click={mouseLeave} on:mouseleave={mouseLeave} transition:fly={{ y: -40, duration: animated ? 600 : 0 }}>
    <img src={path} alt={card.toString()} bind:this={cardImg} />
    <div class="overlay">
        {#each Object.entries(res) as [name, count]}
            <div class="res">
                <img src="/game/img/res/{name}.svg" alt="name" />
                {count}
            </div>
        {/each}
    </div>
</div>


<style lang="less">
    .container {
        position: relative;
        height: 100%;
    }

    img {
        height: 100%;
        border-radius: 5%;
    }

    .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;

        .res {
            display: flex;
            align-items: center;
            background: white;
            color: black;
            padding: 5px;
            gap: 5px;
            border: solid 1px black;

            img {
                width: 1em;
            }
        }
    }
</style>