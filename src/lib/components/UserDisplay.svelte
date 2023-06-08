<script lang="ts">
    import type { UserDetailsDTO } from "tfm_common/lib/dto/user";
    import properties from "../../properties";
    import { timeSince } from "$lib/utils/time";

    export let user: UserDetailsDTO;
    export let details: "left" | "right" | undefined = undefined;

    const registrationTime = new Date(user.registrationTime);
    let accountExists = timeSince(registrationTime);
    setInterval(() => {
        accountExists = timeSince(registrationTime);
    }, 1000);
</script>

<div class="container">
    <img src={ user.hasAvatar ? `${properties.apiRootAddress}/user/avatar?id=${user.id}` : "/img/no_avatar.png" } alt="аватар" />
    <span class="username">{ user.username }</span>
    <div class="tooltip" class:left={ details === "left" } class:right={ details === "right" }>
        <div class="inner-user-container">
            <img src={ user.hasAvatar ? `${properties.apiRootAddress}/user/avatar?id=${user.id}` : "/img/no_avatar.png" } alt="аватар" />
            <span class="username">{ user.username }</span>
        </div>
        <div class="padded">
            <p><b>Уже на сайте:</b> { accountExists }</p>
            {#if user.personal.sex === "male"}
                <p><b>Пол:</b> 👨🏼 джентльмен</p>
            {:else if user.personal.sex === "female"}
                <p><b>Пол:</b> 👩🏼 леди</p>
            {/if}
        </div>
        {#if user.personal.about}
            <div class="padded about-box">
                <p><b>О себе:</b></p>
                <p class="about">{ user.personal.about }</p>
            </div>
        {/if}
    </div>
</div>

<style lang="less">
    @import "/src/vars.less";

    .container {
        position: relative;
        display: flex;
        align-items: center;
        width: fit-content;

        img {
            width: 25px;
            height: 25px;
            margin-right: 10px;
            border-radius: 50%;
        }

        .username {
            .unselectable();
        }

        .tooltip {
            @padding: 10px;

            position: absolute;
            top: calc(0px - @padding - 1px );
            &.left { right: calc(0px - @padding - 1px); }
            &.right { left: calc(0px - @padding - 1px); }
            z-index: 2;

            width: 250px;
            padding: @padding @padding @padding @padding;
            background: @background-color;
            border: solid 1px @border-color;

            transition-duration: 0.5s;
            transition-property: opacity, pointer-events;
            pointer-events: none;
            opacity: 0;

            .inner-user-container {
                display: flex;
                align-items: center;
            }

            p {
                font-size: 9pt;
                &.about {
                    font-style: italic;
                }
            }

            &.left {
                .inner-user-container { justify-content: end; }
                // text-align: right;
            }
        }

        &:hover {
            // img, .username { z-index: 3; }
            .tooltip.left, .tooltip.right {
                pointer-events: all;
                opacity: 1;
            }
        }
    }

    .about-box {
        background: #1b1b1b;
    }

    .padded {
        padding: 1px 10px;
    }
</style>
