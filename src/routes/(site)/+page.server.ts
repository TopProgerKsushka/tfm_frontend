import { lobby } from "$lib/utils/api";
import { errMsg } from "$lib/utils/error_messages";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({cookies, parent}) => {
    const token = cookies.get("token");

    const parentData = await parent();
    if (parentData.auth?.status?.activity === "lobby")
        throw redirect(302, `/lobby?id=${parentData.auth.status.lobbyId}`);
    if (parentData.auth?.status?.activity === "game")
        throw redirect(302, `/game?id=${parentData.auth.status.gameId}`);

    try {
        if (token) {
            const resp = await lobby.list(token);
            if (resp.status === "error") return {
                message: errMsg(resp.error)
            };
            return {
                lobbies: resp.data.lobbies
            };
        }
    } catch (err) {
        cookies.delete("token");
    }
};