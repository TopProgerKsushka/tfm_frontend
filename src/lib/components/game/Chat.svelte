<script lang="ts">
    import { createEventDispatcher, tick } from "svelte";
    import { fade } from "svelte/transition";
    import type { ChatMessage, PlayerDetailsDTO } from "tfm_common/lib/dto/game";

    export let players: PlayerDetailsDTO[];
    export let messages: ChatMessage[];
    let open_ = false;
    let input: HTMLInputElement;

    let chatBox: HTMLElement;
    let savedScrollTop: number | "bottom" = 0;

    const dispatch = createEventDispatcher();

    function keyPressed(evt: KeyboardEvent) {
        if (evt.key === "Enter") {
            const msg = input.value;
            input.value = "";
            dispatch("message", { text: msg });
        }
    }

    function clicked() {
        if (open_) close();
        else open();

        if (open_) {
            dispatch("open");
        } else {
            dispatch("close");
        }
    }

    export function isOpen() { return open_; }
    export function open() {
        if (!open_) {
            open_ = true;
            triggerScroll();
        }
    }
    export function close() {
        if (open_) {
            savedScrollTop = chatBox.scrollTop;
            open_ = false;
        }
    }

    export function addMessage(message: ChatMessage) {
        messages.push(message);
        messages = messages;
        savedScrollTop = "bottom";
        triggerScroll();
    }

    async function triggerScroll() {
        await tick();
        chatBox.scrollTop = savedScrollTop === "bottom" ? chatBox.scrollHeight : savedScrollTop;
    }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
    <svg viewBox="0 0 70 70" class="hand-button" on:click={clicked}>
        <use xlink:href="/game/img/chat.svg#layer1" x="10" y="10" />
    </svg>
    {#if open_}
        <div class="window" transition:fade>
            <div class="messages" bind:this={chatBox}>
                {#each messages as message}
                    <p><b class="player-{message.author}">{players[message.author].user.username}:</b> {message.text}</p>
                {/each}
            </div>
            <input type="text" placeholder="сообщение. . ." on:keypress={keyPressed} bind:this={input} />
        </div>
    {/if}
</div>

<style lang="less">
    @import "/src/vars.less";

    .container {
        position: relative;
    }

    .hand-button {
        margin: 0 20px;
        width: 80px;
        height: 80px;

        .unselectable();

        cursor: pointer;

        use {
            fill: white;
        }

        &:hover {
            use {
                filter: drop-shadow(0 0 10px white);
            }
        }
    }

    .window {
        position: absolute;
        bottom: 100px;
        right: 0px;
        z-index: 10;
        
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;

        width: 400px;
        height: 400px;
        background: #000c;
        border-radius: 20px;

        padding: 10px;
    }

    .messages {
        flex-grow: 1;

        overflow-y: auto;
        
        padding: 10px;
        background: #000c;
    }

    b {
        &.player-0 { color: #f33; }
        &.player-1 { color: #58f; }
        &.player-2 { color: #ff0; }
        &.player-3 { color: #f0f; }
        &.player-4 { color: #0f0; }
    }
</style>
