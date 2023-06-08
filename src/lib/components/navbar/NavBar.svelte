<script lang="ts">
    import properties from "$lib/../properties";
    import type { UserDetailsDTO } from "tfm_common/lib/dto/user";
    import NavBarButton from "./NavBarButton.svelte";

    export let auth: UserDetailsDTO | undefined;

    let logoutForm: HTMLFormElement;

    function logout(evt: MouseEvent) {
        logoutForm.submit();
        return false;
    }
</script>

<div class="navbar">
    <div class="left">
        <a href="/" class="go-home">
            <div class="logo" />
            <div class="title">Покорение Марса</div>
        </a>
    </div>
    <div class="right">
        <div class="nav-button-pane">
            {#if auth}
            <NavBarButton
                iconPath={ auth.hasAvatar ? `${properties.apiRootAddress}/user/avatar?id=${auth.id}` : "/img/no_avatar.png" }
                text={ auth.username }
                bold={true}
                href="/profile" />
            <NavBarButton text="Выход" action="/login?/logout" />
            {:else}
            <NavBarButton text="Вход" href="/login" />
            <NavBarButton text="Регистрация" href="/register" />
            {/if}
        </div>
    </div>
</div>

<style lang="less">
    @import "/src/vars.less";

    .navbar {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 100;
        margin: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        height: @navbar-height;
        background: @navbar-gradient;
        border-bottom: solid 2px rgb(58, 58, 58);

        .left {
            height: 100%;
            margin-left: @navbar-margin;
        }

        .right {
            display: flex;
            height: 100%;
            margin-right: @navbar-margin;
        }
    }

    .go-home {
        display: flex;

        .logo {
            width: 32px;
            height: @navbar-height;
            background: url("/favicon.png") center no-repeat;
        }

        .title {
            margin-left: 10px;
            height: 100%;
            line-height: @navbar-height;
            font-weight: 800;
            .text-border();
        }
    }

    .nav-button-pane {
        display: table;
        border: none;
        border-collapse: collapse;
        height: @navbar-height;
    }
</style>
