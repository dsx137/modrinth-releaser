import * as glob from "@actions/glob";
export async function matchFiles(patterns) {
    const globber = await glob.create(patterns.join("\n"));
    const files = await globber.glob();
    return files;
}
