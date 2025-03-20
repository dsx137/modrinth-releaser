import fetch from "node-fetch";
import values from "./values";
function resolveApi(path) {
    return values.MODRINTH_API + path;
}
export async function fetchToModrinth(method, path, headers = {}, body) {
    return await fetch(resolveApi(path), {
        headers: { "User-Agent": values.userAgent, Authorization: values.token, ...headers },
        body: body,
        method,
    });
}
export async function getMcVersions() {
    return await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json").then(async (res) => {
        if (!res.ok)
            throw Error(`${res.status}: ${await res.text()}`);
        const json = (await res.json());
        return json.versions
            .filter((it) => it.type === "release")
            .map((it) => it.id)
            .reverse();
    });
}
