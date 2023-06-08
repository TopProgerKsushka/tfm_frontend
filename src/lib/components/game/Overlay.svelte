<script lang="ts">
    import { fly } from "svelte/transition";

    let errors: string[] = [];

    export function showErrorMessage(text: string) {
        errors.push(text);
        errors = errors;
        setTimeout(() => {
            errors.shift();
            errors = errors;
        }, 5000);
    }
</script>

<div class="error-box">
    {#each errors as error}
        <div class="error-popup" in:fly={{ y: 20, duration: 500 }} out:fly={{ y: -20, duration: 500 }}>
            {error}
        </div>
    {/each}
</div>

<style lang="less">
    .error-box {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 100;

        pointer-events: none;

        margin: 10px;
        display: flex;
        flex-direction: column;
        align-items: end;
        gap: 10px;
    }

    .error-popup {
        padding: 10px;
        border-radius: 15px;
        background: linear-gradient(#af0000, #610a0a);
    }
</style>
