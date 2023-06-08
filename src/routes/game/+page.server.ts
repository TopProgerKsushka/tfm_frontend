import { game, user, withToken } from "$lib/utils/api";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { DEV_GAME_DATA } from "./dev";

export const load: PageServerLoad = async ({url, cookies}) => {
    const gameId = url.searchParams.get('id');
    if (!gameId) throw redirect(302, "/");

    const resp = await withToken(cookies, (token) => user.get(token));
    if (resp.status === "error") throw redirect(302, "/");

    const gameResp = await withToken(cookies, (token) => game.get(token, gameId));
    if (gameResp.status === "error") throw redirect(302, "/");

    return {
        token: cookies.get("token")!,
        auth: resp.data,
        gameState: gameResp.data,
    };
}

export const actions: Actions = {
    async create({ cookies, request }) {
        const data = await request.formData();
        const id = data.get("lobbyId")?.toString();
        console.error(id);
        if (id === undefined) throw redirect(302, "/");

        const resp = await withToken(cookies, (token) => game.start(token, id));
        if (resp.status === "error") throw redirect(302, "/");

        throw redirect(302, `/game?id=${resp.data.id}`);
    }
};
