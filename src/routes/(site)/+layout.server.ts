import { TokenAuthenticationError, user } from "$lib/utils/api";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const token = cookies.get("token");
    let auth;
    try {
        if (token) {
            const resp = await user.get(token);
            if (resp.status === "error") throw new TokenAuthenticationError();
            auth = resp.data;
        }
    } catch (err) {
        if (err instanceof TokenAuthenticationError) {
            cookies.delete("token");
        }
    }
    return {
        auth
    };
}