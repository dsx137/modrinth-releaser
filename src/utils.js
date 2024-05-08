import * as glob from '@actions/glob'
import fetch from "node-fetch";

export const api_url = "https://api.modrinth.com/v2";

export function parseInputFiles(files) {
    return files.split(/\r?\n/)
        .reduce((accumulator, line) =>
            accumulator
                .concat(line.split(','))
                .filter(pat => pat)
                .map(pat => pat.trim()),
            []
        )
}

export function cleanObject(data) {
    Object.keys(data).forEach(key => {
        if (data[key] === "" || data[key] === undefined) {
            delete data[key];
        }
    });
    return data;
}

export async function matchFilesFromPatterns(patterns) {
    let globber = await glob.create(patterns.join('\n'));
    let files = await globber.glob();
    return files;
}

function getAPI(path) {
    return api_url + path;
}

export async function methodFetch(method, path, data) {
    data.method = method;
    return await fetch(getAPI(path), data)
}