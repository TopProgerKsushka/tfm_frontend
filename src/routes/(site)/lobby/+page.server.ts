import { lobby, withToken } from "$lib/utils/api";
import { errMsg } from "$lib/utils/error_messages";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({cookies, url}) => {
    const id = url.searchParams.get("id");

    if (id) {
        const resp = await withToken(cookies, (token) => lobby.get(token, id));
        if (resp.status === "error") {
            if (resp.error === 3003) throw redirect(302, "/");
            return {
                message: errMsg(resp.error)
            };
        }

        return {
            token: cookies.get("token"),
            lobbyDetails: resp.data
        };
    }
};

export const actions: Actions = {
    async create({cookies, request}) {
        const data = await request.formData();
        const name = data.get("name")!.toString();
        const password = data.get("password")?.toString();

        const resp = await withToken(cookies, (token) => lobby.create(token, name, password));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };

        throw redirect(302, `/lobby?id=${resp.data.id}`);
    },

    async join({cookies, request}) {
        const data = await request.formData();
        const id = data.get("id")!.toString();
        const password = data.get("password")?.toString();

        const resp = await withToken(cookies, (token) => lobby.join(token, id, password));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
        throw redirect(302, `/lobby?id=${id}`);
    },

    async kick({cookies, request}) {
        const data = await request.formData();
        const id = data.get("id")!.toString();
        const userId = data.get("userId")!.toString();

        const resp = await withToken(cookies, (token) => lobby.kick(token, id, userId));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
        throw redirect(302, `/lobby?id=${id}`);
    },

    async changeOwner({cookies, request}) {
        const data = await request.formData();
        const id = data.get("id")!.toString();
        const newOwnerId = data.get("newOwnerId")!.toString();

        const resp = await withToken(cookies, (token) => lobby.changeOwner(token, id, newOwnerId));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
        throw redirect(302, `/lobby?id=${id}`);
    },

    async disband({cookies, request}) {
        const data = await request.formData();
        const id = data.get("lobbyId")!.toString();

        const resp = await withToken(cookies, (token) => lobby.disband(token, id));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
        throw redirect(302, "/");
    },

    async leave({cookies}) {
        const resp = await withToken(cookies, (token) => lobby.leave(token));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
        throw redirect(302, "/");
    }
};
