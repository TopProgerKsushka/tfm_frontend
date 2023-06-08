import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { user } from "$lib/utils/api";
import { errMsg } from "$lib/utils/error_messages";

export const actions: Actions = {
    async default({ cookies, request }) {
        const data = await request.formData();
        const username = data.get("username")!.toString();
        const password = data.get("password")!.toString();
        const repeat = data.get("repeat")?.toString();

        if (password !== repeat) return {
            message: "Введённые пароли не соответствуют друг другу"
        };

        const resp = await user.register( username, password );

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
    }
}