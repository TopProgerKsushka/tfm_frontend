<script lang="ts">
    import { CORP_STATIC } from "tfm_common/lib/corps";
    import type { ResourcesData } from "tfm_common/lib/dto/game";
    import PlayerResourceTable from "./PlayerResourceTable.svelte";

    type CorpAndProjectsResult = { corp: number, projects: number[] };
    type ProjectsResult = number[];
    type Result = CorpAndProjectsResult | ProjectsResult;
    type Resolver = (result: Result | PromiseLike<Result>) => void;

    let active: boolean = false;

    let credits: number;
    let corpsToSelect: number[] | undefined = undefined;
    let projectsToBuy: number[] = [];

    let resolver: Resolver;

    let selectedCorp: number | undefined;
    let selectedProjects: number[] = [];

    let res: ResourcesData | undefined;
    let creditsLeft: number | undefined;
    $: if (corpsToSelect !== undefined) {
        if (selectedCorp !== undefined) {
            res = structuredClone(CORP_STATIC[selectedCorp].res) as ResourcesData;
            res.credits.count = CORP_STATIC[selectedCorp].res.credits.count - selectedProjects.length * 3;
        } else {
            res = undefined;
        }
        creditsLeft = undefined;
    } else {
        res = undefined;
        creditsLeft = credits - selectedProjects.length * 3;
    }

    $: canAccept = corpsToSelect && res !== undefined && res.credits.count >= 0 || creditsLeft !== undefined && creditsLeft >= 0;

    export function corpAndProjects(corps: number[], projects: number[]): Promise<CorpAndProjectsResult> {
        return new Promise((resolve) => {
            corpsToSelect = corps;
            projectsToBuy = projects;
            selectedCorp = undefined;
            selectedProjects = [];
            active = true;
            resolver = resolve as Resolver;
        });
    }

    export function projects(currentCredits: number, projects: number[]): Promise<ProjectsResult> {
        return new Promise((resolve) => {
            credits = currentCredits;
            corpsToSelect = undefined;
            projectsToBuy = projects;
            selectedCorp = undefined;
            selectedProjects = [];
            active = true;
            resolver = resolve as Resolver;
        });
    }

    function clickProject(project: number) {
        return () => {
            const idx = selectedProjects.indexOf(project);
            if (idx === -1) {
                selectedProjects = [...selectedProjects, project];
            } else {
                selectedProjects.splice(idx, 1);
                selectedProjects = selectedProjects;
            }
        };
    }

    function accept() {
        if (corpsToSelect) {
            resolver({
                corp: selectedCorp!,
                projects: selectedProjects,
            });
        } else {
            resolver(selectedProjects);
        }
        active = false;
    }
</script>

{#if active}
    <div class="background">
        {#if corpsToSelect}
            <div class="corp-part">
                <h1>Выберите карту корпорации</h1>
                <div class="corps">
                    {#each corpsToSelect as corp}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <img src="/game/img/corps/{corp}.png" alt={corp.toString()}
                        class="corp card"
                        class:selected={ corp === selectedCorp }
                        on:click={ () => { selectedCorp = corp; } } />
                    {/each}
                </div>
                <PlayerResourceTable resources={res} />
            </div>
        {:else}
            <div class="credits-part">
                <img src="/game/img/res/credits.svg" alt="мегакредиты" />
                { credits - selectedProjects.length * 3 }
            </div>
        {/if}
        
        <div class="proj-part">
            <h1>
                Купите карты проектов
                <img src="/game/img/res/credits.svg" alt="мегакредиты" /> 3
            </h1>
            <div class="projects">
                {#each projectsToBuy as project}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img src="/game/img/projects/{project}.png" alt={project.toString()}
                    class="project card"
                    class:selected={ selectedProjects.includes(project) }
                    on:click={ clickProject(project) } />
                {/each}
            </div>
            <!-- svelte-ignore a11y-invalid-attribute -->
            {#if canAccept}
                <a class="branded big" href="javascript:" on:click={accept}>ПРИНЯТЬ</a>
            {:else}
                <span class="disallowed big">НЕДОСТАТОЧНО СРЕДСТВ</span>
            {/if}
        </div>
    </div>
{/if}

<style lang="less">
    .background {
        position: fixed;
        z-index: 50;
        inset: 0;
        background: #000c;

        display: flex;
    }

    .card {
        border-radius: 5%;
    }

    h1 {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        img {
            height: 1.3em;
            margin: 0 0.5em;
        }
    }

    .corp-part {
        flex: 1 0;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        .corps {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;

            .corp {
                height: 30vh;
                opacity: 60%;

                &.selected {
                    opacity: 100%;
                }
            }
        }
    }

    .credits-part {
        flex: 1 0;

        display: flex;
        align-items: center;
        justify-content: center;
        
        font-size: 25pt;
        font-weight: 800;

        gap: 0.5em;
    }

    .proj-part {
        flex: 2 0;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        .projects {
            display: flex;
            width: calc(30vh / 499 * 356 * 5 + 80px);
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;

            .project {
                opacity: 60%;
                height: 30vh;

                &.selected {
                    opacity: 100%;
                }
            }
        }
    }

    .big {
        margin-top: 20px;
        font-size: 40px;

        &.disallowed {
            color: #c44c4c;
        }
    }
</style>