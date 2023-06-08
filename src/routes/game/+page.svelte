<script lang="ts">
    import Awards from "$lib/components/game/Awards.svelte";
    import BuyCardsDialog from "$lib/components/game/BuyCardsDialog.svelte";
    import Chat from "$lib/components/game/Chat.svelte";
    import DistributeResourcesDialog from "$lib/components/game/DistributeResourcesDialog.svelte";
    import EventLog from "$lib/components/game/EventLog.svelte";
    import Field from "$lib/components/game/Field.svelte";
    import GenerationCounter from "$lib/components/game/GenerationCounter.svelte";
    import MakeChoiceDialog from "$lib/components/game/MakeChoiceDialog.svelte";
    import Milestones from "$lib/components/game/Milestones.svelte";
    import O2Counter from "$lib/components/game/O2Counter.svelte";
    import Overlay from "$lib/components/game/Overlay.svelte";
    import PlayerLine from "$lib/components/game/PlayerLine.svelte";
    import ProjectCardRow from "$lib/components/game/ProjectCardRow.svelte";
    import RangeDialog from "$lib/components/game/RangeDialog.svelte";
    import ScoringDialog from "$lib/components/game/ScoringDialog.svelte";
    import StandardProjects from "$lib/components/game/StandardProjects.svelte";
    import TemperatureCounter from "$lib/components/game/TemperatureCounter.svelte";
    import { onMount, tick } from "svelte";
    import type { PlayerDetailsDTO } from "tfm_common/lib/dto/game";
    import { playableProjectPredicate, standardCityPredicate, standardGreeneryPredicate, standardOceanPredicate } from "tfm_common/lib/predicates";
    import { PROJECT_STATIC } from "tfm_common/lib/projects";
    import "../../global.less";
    import type { PageData } from "./$types";
    import { LongPollClient, game } from "$lib/utils/api";
    import { errMsg } from "$lib/utils/error_messages";
    import type { ClientFunctions, DistributeResourcesInput } from "tfm_common/lib/client_functions";
    import { CORP_STATIC } from "tfm_common/lib/corps";

    export let data: PageData;

    let gameState = data.gameState;

    let specialMessage: string | undefined = undefined;

    let me: PlayerDetailsDTO;
    $: me = gameState.players.find(p => p.user.id === data.auth.id)!;

    let buyCardsDialog: BuyCardsDialog;
    let makeChoiceDialog: MakeChoiceDialog;
    let rangeDialog: RangeDialog;
    let distributeResourcesDialog: DistributeResourcesDialog;
    let scoringDialog: ScoringDialog;
    let overlay: Overlay;
    let field: Field;
    let handRow: ProjectCardRow;
    let playerLines: PlayerLine[] = [];
    let standardProjects: StandardProjects;
    let milestones: Milestones;
    let awards: Awards;

    let chat: Chat;
    let eventLog: EventLog;

    let unmiClickable: boolean = false;
    let unmiResolver: (() => void) | undefined = undefined;

    let cancelButtonClickable: boolean = false;
    let cancelResolver: (() => void) | undefined = undefined;

    let passOrSkipClickable: boolean = false;
    let passOrSkipResolver: (() => void) | undefined = undefined;

    let playersClickable: boolean = false;
    let playerResolver: ((arg: number | PromiseLike<number>) => void) | undefined = undefined;
    let playerPredicate: ((plyaer: PlayerDetailsDTO) => boolean) | undefined = undefined;

    async function selectAction() {
        const actions: any[] = [
            passOrSkip().then(() => ({ action: "skip" })),
            awards.selectAward().then(r => ({ action: "award", award: r  })),
            milestones.selectMilestone().then(r => ({ action: "milestone", milestone: r })),
            standardProjects.selectStandardProject().then(r => ({ action: "standard", standardProject: r })),
            handRow.selectCard(playableProjectPredicate(me.idx, gameState)).then(r => ({ action: "play", project: r })),
            playerLines[me.idx].selectCard((card) => {
                const static_ = PROJECT_STATIC[card.project];
                return static_.type === "active" &&
                    static_.subtype === "action" &&
                    card.gen < gameState.gen &&
                    (
                        !static_.canDoAction ||
                        static_.canDoAction({ me: me.idx, players: gameState.players, field: gameState.field })
                    );
            }).then(r => ({ action: "doAction", project: r }))
        ];
        if (me.corporation === 7 && me.unmiGen! < gameState.gen && me.trGain > 0) {
            actions.push(unmiAction().then(() => ({ action: "unmi" })));
        }
        const result = await Promise.any(actions);

        awards.cancelSelection();
        milestones.cancelSelection();
        standardProjects.cancelSelection();
        handRow.cancelSelection();
        playerLines[me.idx].cancelSelection();
        unmiClickable = false;
        unmiResolver = undefined;
        passOrSkipClickable = false;
        passOrSkipResolver = undefined;

        return result;
    }

    async function placeTile(predicate: (idx: number) => boolean) {
        return await field.placeTile(predicate);
    }

    async function unmiAction(): Promise<void> {
        return new Promise(resolve => {
            unmiResolver = resolve;
            unmiClickable = true;
        });
    }

    function unmiClicked() {
        if (unmiResolver) {
            unmiClickable = false;
            unmiResolver();
        }
    }

    async function cancel(): Promise<void> {
        return new Promise(resolve => {
            cancelResolver = resolve;
            cancelButtonClickable = true;
        });
    }

    function cancelClicked() {
        if (cancelResolver) {
            cancelButtonClickable = false;
            cancelResolver();
        }
    }

    async function passOrSkip(): Promise<void> {
        return new Promise(resolve => {
            passOrSkipResolver = resolve;
            passOrSkipClickable = true;
        });
    }

    function passOrSkipClicked() {
        if (passOrSkipResolver) {
            passOrSkipClickable = false;
            passOrSkipResolver();
        }
    }

    async function selectPlayer(predicate: (player: PlayerDetailsDTO) => boolean): Promise<number> {
        return new Promise(resolve => {
            playersClickable = true;
            playerPredicate = predicate;
            playerResolver = resolve;
        });
    }

    function playerClicked(idx: number) {
        return () => {
            if (playerResolver && playerPredicate && playerPredicate(gameState.players[idx])) {
                playersClickable = false;
                playerPredicate = undefined;
                playerResolver(idx);
                playerResolver = undefined;
            }
        }
    }

    async function process() {
        await tick();
        let ok = false;
        while (!ok) {
            if (gameState.phase === "research" && me.offer) {
                if (gameState.gen === 1 && me.corpOffer) {
                    const buy = await buyCardsDialog.corpAndProjects(me.corpOffer, me.offer);
                    const resp = await game.buy(data.token!, gameState.id, buy.projects, buy.corp);
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                } else {
                    const buy = await buyCardsDialog.projects(me.resources!.credits.count, me.offer);
                    const resp = await game.buy(data.token!, gameState.id, buy);
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                }
            } else if (gameState.phase === "action" && gameState.turn === me.idx) {
                if (me.firstAction) {
                    if (me.corporation === 1) {
                        const resp = await game.action(data.token!, gameState.id, { type: "inventrix" });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                        continue;
                    }
                    if (me.corporation === 4) {
                        const pos = await CLIENT_FUNCTIONS.placeTile("жетон города", standardCityPredicate(gameState.field));
                        const resp = await game.action(data.token!, gameState.id, { type: "tharsis", pos });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                        continue;
                    }
                }
                const action = await selectAction();
                if (action.action === "skip") {
                    if (gameState.canPass) {
                        const resp = await game.pass(data.token!, gameState.id);
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    } else {
                        const resp = await game.skip(data.token!, gameState.id);
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    }
                } else if (action.action === "award") {
                    const resp = await game.action(data.token!, gameState.id, {
                        type: "award",
                        awardName: action.award,
                    });
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                } else if (action.action === "milestone") {
                    const resp = await game.action(data.token!, gameState.id, {
                        type: "milestone",
                        milestoneName: action.milestone,
                    });
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                } else if (action.action === "standard") {
                    if (action.standardProject === 0) {
                        specialMessage = "Выберите карты, которые хотите продать";
                        const projects = await handRow.selectMultipleCards(() => true);
                        specialMessage = undefined;
                        const resp = await game.action(data.token!, gameState.id, {
                            type: "standard_project",
                            standardProjectIdx: 0,
                            projects
                        });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    } else if (action.standardProject === 4 || action.standardProject === 5) {
                        specialMessage = "Разместите жетон озеленения";
                        const pos = await placeTile(standardGreeneryPredicate(gameState.field, me));
                        specialMessage = undefined;
                        const resp = await game.action(data.token!, gameState.id, {
                            type: "standard_project",
                            standardProjectIdx: action.standardProject,
                            pos
                        });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    } else if (action.standardProject === 6) {
                        specialMessage = "Разместите жетон океана";
                        const pos = await placeTile(standardOceanPredicate(gameState.field));
                        specialMessage = undefined;
                        const resp = await game.action(data.token!, gameState.id, {
                            type: "standard_project",
                            standardProjectIdx: action.standardProject,
                            pos
                        });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    } else if (action.standardProject === 7) {
                        specialMessage = "Разместите жетон города";
                        const pos = await placeTile(standardCityPredicate(gameState.field));
                        specialMessage = undefined;
                        const resp = await game.action(data.token!, gameState.id, {
                            type: "standard_project",
                            standardProjectIdx: action.standardProject,
                            pos
                        });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    } else {
                        const resp = await game.action(data.token!, gameState.id, {
                            type: "standard_project",
                            standardProjectIdx: action.standardProject,
                        });
                        if (resp.status === "error") {
                            overlay.showErrorMessage(errMsg(resp.error));
                            continue;
                        }
                        ok = true;
                    }
                } else if (action.action === "play") {
                    const ps = PROJECT_STATIC[action.project];

                    // calculate cost
                    let cost = ps.cost;
                    const cs = CORP_STATIC[me.corporation!];
                    if (cs.effects?.modifyProjectCost) {
                        cost = cs.effects.modifyProjectCost(cost, ps);
                    }
                    for (const bc of me.board) {
                        const bcps = PROJECT_STATIC[bc.project];
                        if (bcps.type === "active" && bcps.subtype === "effect" && bcps.effects?.modifyProjectCost) {
                            cost = bcps.effects.modifyProjectCost(cost, ps);
                        }
                    }

                    // find out which resources may be used to pay
                    const res: DistributeResourcesInput = {};
                    if ((ps.labels ?? []).includes("building")) {
                        res.steel = 2;
                    }
                    if ((ps.labels ?? []).includes("space")) {
                        res.titanium = me.corporation === 3 ? 4 : 3;
                    }
                    if (me.corporation === 8) {
                        res.heat = 1;
                    }

                    // build fee object
                    const fee = Object.keys(res).length > 0
                        ? await distributeResourcesDialog.distributeResources(cost, res)
                        : { credits: cost };
                    
                    let projectData = undefined;
                    if (ps.playClient) {
                        projectData = await ps.playClient({
                            me: me.idx,
                            players: gameState.players,
                            field: gameState.field,
                            ...CLIENT_FUNCTIONS
                        });
                    }
                    const resp = await game.action(data.token!, gameState.id, {
                        type: "play_hand",
                        project: action.project,
                        fee,
                        data: projectData,
                    });
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                } else if (action.action === "doAction") {
                    const ps = PROJECT_STATIC[action.project];

                    let projectData = undefined;
                    if (ps.type === "active" && ps.subtype === "action" && ps.doActionClient) {
                        projectData = await ps.doActionClient({
                            me: me.idx,
                            players: gameState.players,
                            field: gameState.field,
                            ...CLIENT_FUNCTIONS
                        });
                    }
                    const resp = await game.action(data.token!, gameState.id, {
                        type: "do_prject_action",
                        project: action.project,
                        data: projectData,
                    });
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                } else if (action.action === "unmi") {
                    const resp = await game.action(data.token!, gameState.id, {
                        type: "unmi"
                    });
                    if (resp.status === "error") {
                        overlay.showErrorMessage(errMsg(resp.error));
                        continue;
                    }
                    ok = true;
                }
            } else {
                ok = true;
            }
        }
    }

    const CLIENT_FUNCTIONS: ClientFunctions = {
        makeChoice: (variants) => makeChoiceDialog.makeChoice(variants),
        numberInRange: (question, min, max) => rangeDialog.numberBetween(question, min, max),
        distributeResources: (price, res) => distributeResourcesDialog.distributeResources(price, res),
        async placeTile(tileName, predicate) {
            specialMessage = `Разместите ${tileName}`;
            const pos = await placeTile(predicate);
            specialMessage = undefined;
            return pos;
        },
        async selectPlayer(question, predicate) {
            specialMessage = question;
            const player = await selectPlayer(predicate);
            specialMessage = undefined;
            return player;
        },
        async selectBoardCard(question, anyPlayer, predicate) {
            specialMessage = question;
            let asyncResult;
            if (!anyPlayer) {
                asyncResult = playerLines[me.idx].selectCard(predicate);
            } else {
                const tasks = [];
                for (const line of playerLines) {
                    tasks.push(line.selectCard(predicate));
                }
                asyncResult = Promise.any(tasks);
            }
            const project = await asyncResult;
            for (const line of playerLines) {
                line.cancelSelection();
            }
            specialMessage = undefined;
            return project;
        }
    }

    function messageSent(evt: CustomEvent) {
        game.chat(data.token!, gameState.id, evt.detail.text);
    }

    onMount(async () => {
        const lpc = new LongPollClient(data.token!, "/game/events", { id: gameState.id });

        lpc.on("phase_changed", async (evt) => {
            const resp = await game.get(data.token!, gameState.id);
            if (resp.status === "error") return overlay.showErrorMessage(errMsg(resp.error));
            gameState = resp.data;
            specialMessage = undefined;
            eventLog.addEvent({
                type: "phase_changed",
                data: evt
            });
            process();
        });

        lpc.on("generation_changed", async (evt) => {
            const resp = await game.get(data.token!, gameState.id);
            if (resp.status === "error") return overlay.showErrorMessage(errMsg(resp.error));
            gameState = resp.data;
            specialMessage = undefined;
            eventLog.addEvent({
                type: "generation_changed",
                data: evt
            });
            process();
        });

        lpc.on("turn_changed", async (evt) => {
            const resp = await game.get(data.token!, gameState.id);
            if (resp.status === "error") return overlay.showErrorMessage(errMsg(resp.error));
            gameState = resp.data;
            specialMessage = undefined;
            eventLog.addEvent({
                type: "turn_changed",
                data: evt
            });
            process();
        });

        lpc.on("action", async (evt) => {
            const resp = await game.get(data.token!, gameState.id);
            if (resp.status === "error") return overlay.showErrorMessage(errMsg(resp.error));
            gameState = resp.data;
            specialMessage = undefined;
            eventLog.addEvent({
                type: "action",
                data: evt
            });
            process();
        });

        lpc.on("player_skipped_action", (evt) => {
            eventLog.addEvent({
                type: "player_skipped_action",
                data: evt
            });
        });

        lpc.on("player_passed", (evt) => {
            eventLog.addEvent({
                type: "player_passed",
                data: evt
            });
        });

        lpc.on("chat_message", (evt) => {
            chat.addMessage(evt);
        });

        lpc.on("game_finished", (evt) => {
            scoringDialog.showScoring(evt);
        });

        lpc.onError((err) => {
            overlay.showErrorMessage(errMsg(err));
        });

        if (gameState.ei > 0) {
            const resp = await game.events(data.token!, gameState.id, 0);
            if (resp.status === "error") {
                overlay.showErrorMessage(errMsg(resp.error));
            } else {
                for (const event of resp.data.events) {
                    if (event.type !== "game_finished" && event.type !== "chat_message")
                        eventLog.addEvent(event);
                }
            }
        }

        lpc.start(gameState.ei);

        process();
    });
</script>

<div class="status-line">
    {#if specialMessage}
    ⚡️ {specialMessage} ⚡️
    {:else}
        {#if gameState.phase === "research"}
            Фаза исследования.
        {:else}
            Фаза действий.
            {#if gameState.turn !== undefined}
                {#if gameState.players[gameState.turn] === me}
                    ⚡️ Ваш ход. ⚡️
                {:else}
                    Ходит { gameState.players[gameState.turn].user.username }.
                {/if}
            {/if}
        {/if}
    {/if}
</div>
<div class="client">
    <div class="field-container">
        <Field bind:this={field} contents={ gameState.field } />
        <div class="gencounter-container">
            <GenerationCounter generation={ gameState.gen } />
        </div>
        <div class="indicators-container">
            <O2Counter o2={ gameState.oxygen } />
            <TemperatureCounter temperature={ gameState.temperature } />
        </div>
    </div>
    <div class="mid-pane">
        <div class="window">
            <div class="title">
                Награды
                {#if gameState.awards !== undefined}
                    <img src="/game/img/res/credits.svg" alt="мегакредиты" />
                    { gameState.awardPrice }
                {/if}
            </div>
            <Awards bind:this={awards} awards={ gameState.awards } awardPrice={ gameState.awardPrice } me={me} />
        </div>
        <div class="window">
            <div class="title">
                Достижения
                {#if Object.keys(gameState.milestones).length < 3}
                    <img src="/game/img/res/credits.svg" alt="мегакредиты" /> 8
                {/if}
            </div>
            <Milestones bind:this={milestones} milestones={ gameState.milestones } me={me} field={gameState.field} />
        </div>
        <div class="window">
            <div class="title">Стандартные проекты</div>
            <StandardProjects bind:this={standardProjects} gameState={gameState} me={me} />
        </div>
    </div>
    <div class="players-pane">
        {#each gameState.players as player, i}
            <PlayerLine
                bind:this={playerLines[i]}
                player={player} idx={i}
                clickable={playersClickable && playerPredicate && playerPredicate(player)}
                currentPlayer={gameState.phase === "action" && gameState.turn === i}
                passed={player.pass}
                on:click={playerClicked(i)} />
        {/each}
    </div>
</div>
<div class="hand-container">
    {#if me.corporation === 7}
        <div class="button-box">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <svg viewBox="0 0 70 70" class="hand-button" on:click={unmiClicked} class:clickable={unmiClickable}>
                <use xlink:href="/game/img/unmi.svg#layer1" x="10" y="10" />
            </svg>
        </div>
    {/if}
    <div class="hand">
        <div class="inner">
            <ProjectCardRow bind:this={handRow} cards={me.hand} transition="moveUp" />
        </div>
    </div>
    <div class="button-box">
        {#if cancelButtonClickable}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <svg viewBox="0 0 70 70" class="hand-button clickable" on:click={cancelClicked}>
                <use xlink:href="/game/img/cancel.svg#layer1" x="10" y="10" />
            </svg>
        {/if}
        {#if passOrSkipClickable}
            {#if gameState.canPass}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <svg viewBox="0 0 70 70" class="hand-button clickable" on:click={passOrSkipClicked}>
                    <use xlink:href="/game/img/pass.svg#layer1" x="10" y="10" />
                </svg>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <svg viewBox="0 0 70 70" class="hand-button clickable" on:click={passOrSkipClicked}>
                    <use xlink:href="/game/img/skip.svg#layer1" x="10" y="10" />
                </svg>
            {/if}
        {/if}
    </div>
    <div class="space"></div>
    <div class="button-box">
        <EventLog players={gameState.players} bind:this={eventLog} on:open={() => { chat.close(); } } />
        <Chat players={gameState.players} messages={gameState.messages} bind:this={chat} on:open={() => { eventLog.close(); } } on:message={messageSent} />
    </div>
</div>

<BuyCardsDialog bind:this={buyCardsDialog} />
<MakeChoiceDialog bind:this={makeChoiceDialog} />
<RangeDialog bind:this={rangeDialog} />
<DistributeResourcesDialog me={me} bind:this={distributeResourcesDialog} />
<ScoringDialog players={gameState.players} bind:this={scoringDialog} />
<Overlay bind:this={overlay} />

<style lang="less">
    @import "/src/vars.less";

    :global(body) {
        background: url("/game/img/background.jpg") no-repeat center center fixed;
        background-size: cover;
    }

    .status-line {
        position: fixed;
        top: 0;
        z-index: 9;
        width: 100%;
        height: 50px;
        background: linear-gradient(#000, #000 50%, #0000);
        text-align: center;
        padding-top: 20px;
    }

    .client {
        display: flex;
        margin-top: 80px;
        margin-bottom: 164px;
        gap: 20px;
        width: 100%;
    }

    .field-container {
        position: relative;
        flex: 1 1;
        .unselectable();

        .gencounter-container {
            position: absolute;
            top: 0;
            right: 0;
        }

        .indicators-container {
            position: absolute;
            left: 20px;
            bottom: 20px;

            display: inline-flex;
            flex-direction: column;
            gap: 20px;
        }
    }

    .mid-pane {
        flex: 0 0;
        display: flex;
        flex-direction: column;
        // width: 250px;
        height: 100%;
        gap: 10px;
    }

    .window {
        background-color: #0008;
        // flex-grow: 1;
        padding: 20px;
        border-radius: 30px;

        .unselectable();

        .title {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            margin-bottom: 20px;

            img {
                height: 1.5em;
                margin: 0 5px;
            }
        }
    }

    .players-pane {
        max-width: 40vw;
        flex: 1 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .hand-container {
        position: fixed;
        bottom: 0px;
        z-index: 9;
        display: flex;
        align-items: end;
        width: 100%;
        height: 164px;
        background: linear-gradient(#0000, #000c 30%, #000c);
    }

    .hand {
        flex: auto 0;
        height: 164px;
        display: flex;
        align-items: end;
        overflow-x: auto;
        overflow-y: hidden;

        .inner {
            height: 144px;
            transform: translateY(20px);
        }

        scrollbar-width: 3px;
        scrollbar-color: white transparent;

        &::-webkit-scrollbar {
            height: 7px;
            width: 7px;
        }

        &::-webkit-scrollbar-track {
            background-color: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background-color: white;
            border-radius: 3px;
            border: 2px solid black;
        }
    }

    .button-box {
        flex: 0 0;
        display: flex;
        margin-bottom: 10px;
    }

    .space {
        flex: 1 0;
    }

    .hand-button {
        margin: 0 20px;
        width: 80px;
        height: 80px;

        .unselectable();

        use {
            fill: rgb(129, 129, 129);
        }

        &.clickable {

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
    }
</style>