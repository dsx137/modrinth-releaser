import * as glob from "@actions/glob";

export function isNil(it: unknown): it is null | undefined {
  return it === null || it === undefined;
}

export function isEmpty(it: string): boolean {
  return it.trim() === "";
}

export function isNilOrEmpty<T>(it: T): boolean {
  return isNil(it) || (typeof it === "string" && isEmpty(it));
}

export function isIn<T>(l: readonly T[], it: unknown): it is T {
  return l.includes(it as T);
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

export function trimObject<T extends { [key: string | number | symbol]: unknown }>(
  obj: T,
  seen = new WeakSet()
): { [K in keyof T]: T[K] } {
  if (seen.has(obj)) return obj;
  seen.add(obj);

  const ret = {} as T;

  for (const [k, v] of Object.keys(obj).entries()) {
    if (isNilOrEmpty(v)) break;

    if (typeof v !== "object") {
      ret[k] = v;
      break;
    }

    const trimmed = trimObject(v, seen);
    if (isNilOrEmpty(trimmed)) break;
    ret[k] = trimmed;
  }

  return ret;
}

export async function matchFiles(patterns: string[]): Promise<string[]> {
  const globber: glob.Globber = await glob.create(patterns.join("\n"));
  const files: string[] = await globber.glob();
  return files;
}
