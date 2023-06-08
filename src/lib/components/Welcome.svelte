<div class="title">
    <span>
        Онлайн-реализация настольной игры<br/>
        «Покорение Марса»
    </span>
</div>
<div class="description">
    <span>
        Космос всегда манил человечество своей красотой и непокорностью.
        Шли времена, развивались технологии и вот уже мегакорпорации всерьез
        нацелились на колонизацию Марса при поддержке мирового правительства.
        В ход идет все от ядерных взрывов и шаттлов с наемниками до труда
        роботов и кражи энергии у конкурентов – главное сделать красную планету
        пригодной для жизни, а уж как вы этого будете добиваться – целиком на вашей совести.
    </span>
</div>

<style lang="less">
    .title {
        margin-top: 80px;
        text-align: right;
        font-size: clamp(16pt, 3vw, 35pt);
        font-weight: 800;

        animation-name: slidein;
        animation-duration: 1s;
        animation-delay: 0.5s;
        animation-fill-mode: backwards;
        
        @keyframes slidein {
            from {
                transform: translateX(-30px);
                opacity: 0;
            }

            tp {
                transform: translateX(0);
                opacity: 100%;
            }
        }

        span {
            background: black;
            padding: 0 0.3rem;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
        }
    }

    .description {
        margin-top: 20px;
        text-align: right;
        font-size: clamp(11pt, 2vw, 20pt);

        animation-name: slidein;
        animation-duration: 1s;
        animation-delay: 2s;
        animation-fill-mode: backwards;
        
        @keyframes slidein {
            from {
                transform: translateX(-30px);
                opacity: 0;
            }

            tp {
                transform: translateX(0);
                opacity: 100%;
            }
        }

        span {
            background: black;
            padding: 0 0.3rem;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
        }

        &::before {
            content: "";
            float: left;
            width: 100%;
            height: calc(100vh - 300px);
            clip-path: polygon(0 0, 30% 0, 90% 100%, 0 100%);
            shape-outside: polygon(0 0, 30% 0, 90% 100%, 0 100%);
        }
    }
</style>