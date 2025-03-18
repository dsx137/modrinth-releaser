import * as utils from "./utils";
import * as values from "./values";

function resolveApi(path: string): string {
  return values.MODRINTH_API + path;
}

export function fetchToModrinth(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body: unknown = undefined
) {
  const data = utils.trimObject({
    headers: {
      "User-Agent": values.USER_AGENT,
      Authorization: values.API_TOKEN,
      ...headers,
    },
    body: body,
  }) as RequestInit;
  data.method = method;
  return fetch(resolveApi(path), data);
}
