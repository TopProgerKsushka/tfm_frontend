import properties from "$lib/../properties";
import type { LobbyDetailsDTO, LobbyListItemDTO } from "tfm_common/lib/dto/lobby";
import type { UserDetailsDTO } from "tfm_common/lib/dto/user";
import { redirect, type Cookies } from "@sveltejs/kit";
import type { GameStateDTO } from "tfm_common/lib/dto/game";
import type { Action } from "tfm_common/lib/action";
import type { GameEvent } from "tfm_common/lib/events/game";

async function apiPost(endpoint: string, token: string | null, data: any, contentType?: string): Promise<Response> {
    if (endpoint[0] === "/") endpoint = endpoint.substring(1);
    const headers: Record<string, string> = {
        "Content-Type": contentType ?? "application/json",
    };
    if (token) headers["x-auth-token"] = token;
    const resp = await fetch(`${properties.apiRootAddress}/${endpoint}`, {
        method: "post",
        headers: headers,
        body: data,
    });
    if (resp.status === 401) throw new TokenAuthenticationError("token not provided");
    if (resp.status === 403) throw new TokenAuthenticationError("wrong token");
    return resp;
}

async function apiGet(endpoint: string, token: string | null, query?: Record<string, any>): Promise<Response> {
    if (endpoint[0] === "/") endpoint = endpoint.substring(1);
    const headers: Record<string, string> = {};
    if (token) headers["x-auth-token"] = token;
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v === undefined) delete query[k];
        }
    }
    let url = `${properties.apiRootAddress}/${endpoint}`;
    if (query && Object.keys(query).length > 0) url += "?" + new URLSearchParams(query);
    const resp = await fetch(url, {
        method: "get",
        headers: headers,
    });
    if (resp.status === 401) throw new TokenAuthenticationError("token not provided");
    if (resp.status === 403) throw new TokenAuthenticationError("wrong token");
    return resp;
};

type ErrorCallback = (errorCode: number) => void;
type EventCallback = (data: any) => void;

export class LongPollClient {
    #active: boolean = false;
    #token: string;
    #endpoint: string;
    #query?: Record<string, string>;

    #errorCallbacks: ErrorCallback[] = [];
    #eventCallbacks: Record<string, EventCallback[]> = {};

    constructor(token: string, endpoint: string, query?: Record<string, string>) {
        this.#token = token;
        this.#endpoint = endpoint;
        this.#query = query;
    }

    async start(ei: number) {
        this.#active = true;
        let currentEi = ei;
        while (this.#active) {
            const resp = await apiGet(this.#endpoint, this.#token, { ei: currentEi, ...this.#query });
            const body = await resp.json();
            if (!this.#active) break;
            
            if (body.status === "error") {
                for (const cb of this.#errorCallbacks) cb(body.error);
                break;
            }
            currentEi = body.data.ei;
            for (const event of body.data.events) {
                const cbs = this.#eventCallbacks[event.type];
                if (cbs && cbs.length > 0) {
                    for (const cb of cbs) cb(event.data);
                }
            }
        }
    }

    stop() {
        this.#active = false;
    }

    onError(cb: ErrorCallback) {
        this.#errorCallbacks.push(cb);
    }

    on(eventType: string, cb: EventCallback) {
        if (!this.#eventCallbacks[eventType]) this.#eventCallbacks[eventType] = [];
        this.#eventCallbacks[eventType].push(cb);
    }
}

export function withToken<T>(cookies: Cookies, action: (token: string) => T): T {
    const token = cookies.get("token");
    if (!token) throw redirect(302, "/");
    try {
        return action(token);
    } catch (e) {
        if (e instanceof TokenAuthenticationError) {
            cookies.delete("token");
            throw redirect(302, "/");
        }
        throw e;
    }
}

type ApiResponse<T> = {
    status: "ok",
    data: T
} | {
    status: "error",
    error: number,
};

type UserRegisterLoginResponse = ApiResponse<{
    token: string,
}>;

type UserGetResponse = ApiResponse<UserDetailsDTO>;

type LobbyCreateResponse = ApiResponse<{
    id: string,
}>;

type LobbyGetResponse = ApiResponse<LobbyDetailsDTO>;

type LobbyListResponse = ApiResponse<{
    lobbies: LobbyListItemDTO[],
}>;

type GameStartResponse = ApiResponse<{
    id: string,
}>;

type GameGetResponse = ApiResponse<GameStateDTO>;

type GameEventsResponse = ApiResponse<{
    ei: number,
    events: GameEvent[],
}>;

type EmptyResponse = ApiResponse<undefined>

export class TokenAuthenticationError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "TokenAuthenticationError";
    }
}

export namespace user {
    export async function register(username: string, password: string): Promise<UserRegisterLoginResponse> {
        const data = JSON.stringify({ username, password });
        const resp = await apiPost("/user/register", null, data);
        return await resp.json();
    }

    export async function login(username: string, password: string): Promise<UserRegisterLoginResponse> {
        const data = JSON.stringify({ username, password });
        const resp = await apiPost("/user/login", null, data);
        return await resp.json();
    }

    export async function get(token: string, id?: string): Promise<UserGetResponse> {
        const resp = await apiGet("/user/get", token, { id });
        return await resp.json();
    }

    export async function setAvatar(token: string, avatarFile: File): Promise<EmptyResponse> {
        const resp = await apiPost("/user/avatar", token, avatarFile, avatarFile.type);
        return await resp.json();
    }

    export async function setPersonal(token: string, sex?: string, about?: string): Promise<EmptyResponse> {
        const data = JSON.stringify({ sex, about });
        const resp = await apiPost("/user/personal", token, data);
        return await resp.json();
    }
}

export namespace lobby {
    export async function create(token: string, name: string, password?: string): Promise<LobbyCreateResponse> {
        const data = JSON.stringify({name, password});
        const resp = await apiPost("/lobby/create", token, data);
        return await resp.json();
    }

    export async function join(token: string, id: string, password?: string): Promise<EmptyResponse> {
        const data = JSON.stringify({id, password});
        const resp = await apiPost("/lobby/join", token, data);
        return await resp.json();
    }

    export async function get(token: string, id: string): Promise<LobbyGetResponse> {
        const resp = await apiGet("/lobby/get", token, { id });
        return await resp.json();
    }

    export async function list(token: string): Promise<LobbyListResponse> {
        const resp = await apiGet("/lobby/list", token);
        return await resp.json();
    }

    export async function kick(token: string, id: string, userId: string): Promise<EmptyResponse> {
        const data = JSON.stringify({id, userId});
        const resp = await apiPost("/lobby/kick", token, data);
        return await resp.json();
    }

    export async function changeOwner(token: string, id: string, newOwnerId: string): Promise<EmptyResponse> {
        const data = JSON.stringify({id, newOwnerId});
        const resp = await apiPost("/lobby/change_owner", token, data);
        return await resp.json();
    }

    export async function disband(token: string, id: string): Promise<EmptyResponse> {
        const data = JSON.stringify({id});
        const resp = await apiPost("/lobby/disband", token, data);
        return await resp.json();
    }

    export async function leave(token: string): Promise<EmptyResponse> {
        const resp = await apiPost("/lobby/leave", token, undefined);
        return await resp.json();
    }
}

export namespace game {
    export async function start(token: string, lobbyId: string): Promise<GameStartResponse> {
        const data = JSON.stringify({ lobbyId });
        const resp = await apiPost("/game/start", token, data);
        return await resp.json();
    }

    export async function buy(token: string, id: string, projects: number[], corp?: number): Promise<EmptyResponse> {
        const data = JSON.stringify({
            id,
            projects,
            ...(corp !== undefined && { corp }),
        });
        const resp = await apiPost("/game/buy", token, data);
        return await resp.json();
    }

    export async function action(token: string, id: string, action: Action): Promise<EmptyResponse> {
        const data = JSON.stringify({ id, action });
        const resp = await apiPost("/game/action", token, data);
        return await resp.json();
    }

    export async function pass(token: string, id: string): Promise<EmptyResponse> {
        const data = JSON.stringify({ id });
        const resp = await apiPost("/game/pass", token, data);
        return await resp.json();
    }

    export async function skip(token: string, id: string): Promise<EmptyResponse> {
        const data = JSON.stringify({ id });
        const resp = await apiPost("/game/skip", token, data);
        return await resp.json();
    }

    export async function chat(token: string, id: string, message: string): Promise<EmptyResponse> {
        const data = JSON.stringify({ id, message });
        const resp = await apiPost("/game/chat", token, data);
        return await resp.json();
    }

    export async function get(token: string, id: string): Promise<GameGetResponse> {
        const resp = await apiGet("/game/get", token, { id });
        return await resp.json();
    }

    export async function events(token: string, id: string, ei: number): Promise<GameEventsResponse> {
        const resp = await apiGet("/game/events", token, { id, ei });
        return await resp.json();
    }
}
