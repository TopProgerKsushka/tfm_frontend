<script lang="ts">
    export let iconPath: string | undefined = undefined;
    export let text: string;
    export let href: string | undefined = undefined;
    export let action: string | undefined = undefined;
    export let bold: boolean = false;

    let navForm: HTMLFormElement;

    function doAction() {
        navForm.submit();
        return false;
    }
</script>

<a class="nav-button" href={ href ? href : "javascript:" } on:click={ action ? doAction : undefined }>
    <div class="container">
        {#if iconPath}
        <img src={ iconPath } alt="" />
        {/if}
        <span class={ bold ? "bold" : "" }>{ text }</span>
    </div>
</a>
{#if action}
    <form method="post" action={action} bind:this={navForm}></form>
{/if}

<style lang="less">
    @import "/src/vars.less";

    .nav-button {
        display: table-cell;
        height: @navbar-height;
        vertical-align: middle;
        text-align: center;
        padding: 0px 20px;
        border-left: solid 1px rgb(58, 58, 58);
        border-right: solid 1px rgb(58, 58, 58);

        transition-property: text-shadow;
        transition-duration: 1s;

        img {
            transition-property: box-shadow;
            transition-duration: 1s;
        }

        .glowborder() {
            display: inline-block;
            position: absolute;
            content: " ";
            width: 3px;
            height: @navbar-height;
            background-color: #777;
            border-radius: 50%;
            box-shadow: 0 0 10px rgb(255, 255, 255);
            opacity: 0%;
            transition-property: opacity;
            transition-duration: 1s;
        }

        &::before {
            .glowborder();
            transform: translateX(-22px);
        }

        &::after {
            .glowborder();
            transform: translateX(19px);
        }

        &:hover {
            text-shadow: 0 0 10px #fff;

            &::before, &::after {
                opacity: 100%;
            }

            img {
                box-shadow: 0 0 10px rgb(255, 255, 255);
            }
        }

        &:active {
            background: @navbar-button-active-gradient;
        }
    }

    .container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: @navbar-height;

        img {
            height: 70%;
            border-radius: 50%;
            margin-right: 15px;
        }

        span.bold {
            font-weight: 800;
        }
    }
</style>