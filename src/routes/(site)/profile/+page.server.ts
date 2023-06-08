import { user, withToken } from "$lib/utils/api";
import { errMsg } from "$lib/utils/error_messages";
import type { LayoutServerLoad } from "../$types";
import type { Actions } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const resp = await withToken(cookies, (token) => user.get(token));
    if (resp.status === "error") return {
        message: resp.error
    };
    return {
        auth: resp.data
    };
}

export const actions: Actions = {
    async uploadAvatar({ cookies, request }) {
        const form = await request.formData();
        const file = form.get("avatar") as File;
        const resp = await withToken(cookies, (token) => user.setAvatar(token, file));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
    },

    async updatePersonalInfo({ cookies, request }) {
        const form = await request.formData();
        const sex = form.get("sex")?.toString() === "undefined" ? undefined : form.get("sex")?.toString();
        const about = form.get("about")?.toString();

        const resp = await withToken(cookies, (token) => user.setPersonal(token, sex, about));
        if (resp.status === "error") return {
            message: errMsg(resp.error)
        };
    }
}
