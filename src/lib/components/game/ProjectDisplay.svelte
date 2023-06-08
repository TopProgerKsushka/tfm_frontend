<script lang="ts">
    import { PROJECT_STATIC } from "tfm_common/lib/projects";

    export let project: number;

    $: ps = PROJECT_STATIC[project];
    $: path = `/game/img/projects/${project}.png`;

    let span: HTMLElement;
    let popup: HTMLElement | undefined = undefined;

    function mouseEnter() {
        showPopup();
    }

    function mouseLeave() {
        hidePopup();
    }

    function showPopup() {
        const padding = 10;

        const imgWidth = 356;
        const imgHeight = 499;

        const rect = span.getBoundingClientRect();

        const h = Math.floor(window.innerHeight * 0.4);
        const w = Math.floor((h / imgHeight) * imgWidth);

        const x =
            rect.x - w - padding * 2 > 0
            ? rect.x - (w + padding * 2)
            : rect.x + rect.width;

        const y =
            (rect.y + rect.height) + h + padding * 2 < window.innerHeight
            ? rect.y + rect.height
            : rect.y - (h + padding * 2);

        popup = document.createElement("div");
        popup.style.pointerEvents = "none";
        popup.style.position = "fixed";
        popup.style.zIndex = "15";
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

<span class="project-name {ps.type}" bind:this={span} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave}>{ ps.name }</span>

<style lang="less">
    .project-name {
        cursor: help;
        padding: 0 3px;
        font-weight: 800;

        &.active { color: #427afd; }
        &.automated { color: #00d800; }
        &.event { color: #fa0d0d; }

        &:hover {
            color: black;
            &.active { background-color: #427afd; }
            &.automated { background-color: #00d800; }
            &.event { background-color: #fa0d0d; }
        }
    }
</style>
