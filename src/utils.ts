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

export function getError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
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

export function trimObject<T extends { [key: string | number | symbol]: unknown }>(obj: T, seen = new WeakSet()): T {
  if (seen.has(obj)) return obj;
  seen.add(obj);

  const ret = {} as T;

  Object.entries(obj).forEach(([k, v]) => {
    if (isNilOrEmpty(v)) return;

    if (typeof v !== "object" || Array.isArray(v)) {
      ret[k as keyof T] = v as T[keyof T];
      return;
    }

    const trimmed = trimObject(v as { [key: string]: unknown; [key: number]: unknown; [key: symbol]: unknown }, seen);
    if (isNilOrEmpty(trimmed)) return;
    ret[k as keyof T] = trimmed as T[keyof T];
  });
  return ret;
}

export async function matchFiles(patterns: string[]): Promise<string[]> {
  const globber: glob.Globber = await glob.create(patterns.join("\n"));
  const files: string[] = await globber.glob();
  return files;
}
