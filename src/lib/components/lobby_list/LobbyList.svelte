<script lang="ts">
    import type { LobbyListItemDTO } from "tfm_common/lib/dto/lobby";
    import LobbyListItem from "./LobbyListItem.svelte";

    export let lobbies: LobbyListItemDTO[];
</script>

<div class="lobby-list">
    {#each lobbies as lobby}
        <LobbyListItem lobby={lobby} />
    {/each}
</div>

<style lang="less">
    .lobby-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>
