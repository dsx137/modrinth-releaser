import * as glob from "@actions/glob";
import * as values from "./values";

export function isNil(it: unknown): it is null | undefined {
  return it === null || it === undefined;
}

export function isEmpty(it: string): boolean {
  return it.trim() === "";
}

export function isNilOrEmpty<T>(it: T): boolean {
  return isNil(it) || (typeof it === "string" && isEmpty(it));
}

export function parsePair(pair: string) {
  const parts = pair.split(":").map((it: string) => it.trim());
  if (parts.length !== 2) {
    throw new Error(`Invalid pair format: "${pair}". Expected "key:value".`);
  }
  return parts as [string, string];
}

export function parseList(list: string) {
  return list
    .split(",")
    .map((it: string) => it.trim())
    .filter((it: string) => it);
}

export function trimObject<T extends object>(obj: T, seen = new WeakSet()): T {
  if (seen.has(obj)) return obj;
  seen.add(obj);

  const ret = {};

  Object.keys(obj).forEach((key) => {
    if (isNilOrEmpty(obj[key])) return;

    if (typeof obj[key] === "object") {
      const trimmed = trimObject(obj[key], seen);
      if (isNilOrEmpty(trimmed)) return;
      ret[key] = trimmed;
    }
  });

  return ret as T;
}

export async function matchFiles(patterns: string[]): Promise<string[]> {
  const globber: glob.Globber = await glob.create(patterns.join("\n"));
  const files: string[] = await globber.glob();
  return files;
}

export async function getMcVersions() {
  return await fetch(values.VERSION_MANIFEST_URL).then(async (res: Response) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    const json: { versions: { type: string; id: string }[] } = await res.json();
    return json.versions
      .filter((it: { type: string }) => it.type === "release")
      .map((it: { id: string }) => it.id)
      .reverse();
  });
}
