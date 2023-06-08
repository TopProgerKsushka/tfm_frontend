<script lang="ts">
    import type { ResourcesData } from "tfm_common/lib/dto/game";

    export let resources: ResourcesData | undefined;

    function plus(n: number) {
        if (n >= 0) return `+${n}`;
        else return n.toString();
    }
</script>

<div class="table">
    <div class="row">
        <div class="res cell">
            <img src="/game/img/res/plants.svg" alt="растения" />
        </div>
        <div class="value cell">
            {resources ? resources.plants.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.plants.production) : "?" })
        </div>
        <div class="res cell">
            <img src="/game/img/res/credits.svg" alt="мегакредиты" />
        </div>
        <div class="value cell">
            {resources ? resources.credits.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.credits.production) : "?" })
        </div>
    </div>
    <div class="row">
        <div class="res cell">
            <img src="/game/img/res/energy.svg" alt="энергия" />
        </div>
        <div class="value cell">
            {resources ? resources.energy.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.energy.production) : "?" })
        </div>
        <div class="res cell">
            <img src="/game/img/res/steel.svg" alt="сталь" />
        </div>
        <div class="value cell">
            {resources ? resources.steel.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.steel.production) : "?" })
        </div>
    </div>
    <div class="row">
        <div class="res cell">
            <img src="/game/img/res/heat.svg" alt="тепло" />
        </div>
        <div class="value cell">
            {resources ? resources.heat.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.heat.production) : "?" })
        </div>
        <div class="res cell">
            <img src="/game/img/res/titanium.svg" alt="титан" />
        </div>
        <div class="value cell">
            {resources ? resources.titanium.count : "??"}
        </div>
        <div class="production cell">
            ({ resources ? plus(resources.titanium.production) : "?" })
        </div>
    </div>
</div>

<style lang="less">
    img {
        height: 1em;
    }

    .table {
        display: table;

        .row {
            display: table-row;

            .cell {
                display: table-cell;
                vertical-align: middle;
                padding: 2px 3px;
            }
        }
    }

    .production {
        padding-right: 15px!important;
        color: #b96900;
    }
</style>
