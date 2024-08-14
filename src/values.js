import core from "@actions/core";
import github from "@actions/github";

export const api_token = process.env.MODRINTH_TOKEN;
export const user_agent = `${github.context.repo.owner}/${github.context.repo.repo}/${github.context.sha}`

export const project_id = core.getInput("project_id");
export const version_number = core.getInput("version_number");
export const files = core.getInput("files");
export const name = core.getInput("name");
export const changelog = core.getInput("changelog");
export const changelog_file = core.getInput("changelog_file");
export const dependencies = core.getInput("dependencies");
export const game_versions = core.getInput("game_versions");
export const version_type = core.getInput("version_type");
export const loaders = core.getInput("loaders");
export const featured = core.getBooleanInput("featured");
export const status = core.getInput("status");
export const requested_status = core.getInput("requested_status");
export const updatable = core.getBooleanInput("updatable");
export const delete_old_files = core.getBooleanInput("delete_old_files");
