<script lang="ts">
    import type { ActionData } from "./$types";

    function submitForm(evt: MouseEvent) {
        const sumbit = evt.target as Element;
        const form = sumbit.closest('form');
        form!.submit();
        return false;
    }

    export let form: ActionData;
</script>

<div class="container">
    <form method="post">
        {#if form?.message}
        <div class="error-message">
            {form.message}
        </div>
        {/if}
        <input type="text" name="username" placeholder="логин" />
        <input type="password" name="password" placeholder="пароль" />
        <input type="password" name="repeat" placeholder="повторите пароль" />
        <div class="submit-container">        
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="javascript:" on:click={submitForm} class="submit branded">ЗАРЕГИСТРИРОВАТЬСЯ</a>
        </div>
        <div>
            <a class="branded" href="/login">уже есть аккаунт</a>
        </div>
    </form>
</div>

<style lang="less">
    @import "/src/vars.less";

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100vh - @navbar-height);
    }

    form {
        display: flex;
        flex-direction: column;
        width: 400px;
        gap: 20px;
        background: @background-color;
        border: double 4px @border-color;
        padding: 40px;
    }

    form > input {
        font-size: 20pt;
        text-align: center;
    }

    .submit-container {
        text-align: center;
        margin: 20px 0;
    }

    .submit {
        font-size: 20pt;
        font-weight: bold;
    }
</style>