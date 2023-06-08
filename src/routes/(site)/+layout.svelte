<script lang="ts">
    import "../../global.less";
    import NavBar from "$lib/components/navbar/NavBar.svelte";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;
</script>

<NavBar auth={data.auth} />
<div class="content">
    <slot></slot>
</div>

<style lang="less">
    @import "/src/vars.less";

    :global(body) {
        background: url("/img/background.png") no-repeat center center fixed;
        background-size: cover;
    }

    .content {
        padding: @navbar-height 8vw 0 8vw;
    }
</style>