import { dev } from "$app/environment";
import { user } from "$lib/utils/api";
import { errMsg } from "$lib/utils/error_messages";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    async login({ cookies, request }) {
        const data = await request.formData();
        const username = data.get("username")!.toString();
        const password = data.get("password")!.toString();

        const resp = await user.login(username, password);

        if (resp.status === "error") {
            return { message: errMsg(resp.error) };
        }

        cookies.set("token", resp.data.token, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: !dev,
            maxAge: 60 * 60 * 24 * 30,
        });
        throw redirect(302, "/");
    },

    async logout({ cookies }) {
        cookies.delete("token");
        throw redirect(302, "/");
    },
}