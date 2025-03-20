import fetch from "node-fetch";
import values from "./values";
import { HeadersInit, BodyInit } from "node-fetch";

function resolveApi(path: string): string {
  return values.MODRINTH_API + path;
}

export async function fetchToModrinth(method: string, path: string, headers: HeadersInit = {}, body?: BodyInit) {
  return await fetch(resolveApi(path), {
    headers: { "User-Agent": values.userAgent, Authorization: values.token, ...headers },
    body: body,
    method,
  });
}

export async function getMcVersions() {
  return await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json").then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { versions: { type: string; id: string }[] };
    return json.versions
      .filter((it: { type: string }) => it.type === "release")
      .map((it: { id: string }) => it.id)
      .reverse();
  });
}
