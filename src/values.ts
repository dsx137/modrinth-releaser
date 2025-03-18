import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as lib from "./lib";
import * as defs from "./defs";
import * as utils from "./utils";

// 常量
export const VERSION_MANIFEST_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
export const MODRINTH_API = "https://api.modrinth.com/v1";

// 环境变量和上下文
export const API_TOKEN = process.env.MODRINTH_TOKEN;
export const USER_AGENT = `${github.context.repo.owner}/${github.context.repo.repo}/${github.context.sha}`;

// 从输入中获取的值
export const INPUTS = lib.lazy({
  projectId: () => core.getInput("project_id"),
  versionNumber: () => core.getInput("version_number"),
  files: async () =>
    await utils
      .matchFiles(
        core
          .getInput("files")
          .split(/\r?\n/)
          .flatMap((line) => utils.parseList(line))
          .filter((pattern) => pattern)
      )
      .then((files) => {
        return files.map((file) => {
          return { name: path.basename(file), path: file } as defs.File;
        });
      }),
  name: () => core.getInput("name"),
  changelog: () => {
    let changelog = core.getInput("changelog");

    if (fs.existsSync(changelog)) {
      try {
        changelog = fs.readFileSync(changelog, "utf-8");
      } catch {
        core.warning(`Failed to read changelog file: ${changelog}`);
      }
    } else {
      core.notice("Changelog file not found, fallback to given changelog");
    }
    return changelog;
  },
  dependencies: () =>
    utils.parseList(core.getInput("dependencies")).map((dep) => {
      const [project_id, dependency_type] = utils.parsePair(dep);
      if (!utils.isIn(defs.DEPENDENCY_TYPES, dependency_type)) {
        throw Error(`Invalid dependency type: ${dependency_type}`);
      }
      return { project_id, dependency_type } as defs.Dependency;
    }),
  gameVersions: async () => {
    const minecraftVersions = await getMcVersions();
    return utils
      .parseList(core.getInput("game_versions"))
      .map((game_version) => {
        if (game_version.split(":").length === 1) {
          const index = minecraftVersions.indexOf(game_version);
          if (index === -1) throw Error(`Invalid minecraft version: ${game_version}`);
          return [game_version];
        } else {
          const [start_game_version, end_game_version] = utils.parsePair(game_version);
          const start_index: number = minecraftVersions.indexOf(start_game_version);
          const end_index: number = minecraftVersions.indexOf(end_game_version);
          if (start_index === -1) throw Error(`Invalid minecraft start version: ${start_game_version}`);
          if (end_index === -1) throw Error(`Invalid minecraft end version: ${end_game_version}`);
          if (start_index > end_index) throw Error(`Start version is greater than end version: ${game_version}`);
          return minecraftVersions.slice(start_index, end_index + 1);
        }
      })
      .flat();
  },
  versionType: () => {
    const versionType = core.getInput("version_type");
    if (!utils.isIn(defs.VERSION_TYPES, versionType)) {
      throw Error(`Invalid version type: ${versionType}, expected one of ${defs.VERSION_TYPES.join(", ")}`);
    }
    return versionType as defs.VersionType;
  },
  loaders: () => {
    const loaders = utils.parseList(core.getInput("loaders"));
    loaders.forEach((loader) => {
      if (!utils.isIn(defs.LOADERS, loader)) {
        throw Error(`Invalid loader: ${loader}, expected one of ${defs.LOADERS.join(", ")}`);
      }
    });
    return loaders as defs.Loader[];
  },
  featured: () => core.getBooleanInput("featured"),
  status: () => {
    const status = core.getInput("status");
    if (!utils.isIn(defs.STATUSES, status)) {
      throw Error(`Invalid status: ${status}, expected one of ${defs.STATUSES.join(", ")}`);
    }
    return status as defs.Status;
  },
  requestedStatus: () => {
    const requestedStatus = core.getInput("requested_status");
    if (!utils.isIn(defs.REQUESTED_STATUSES, requestedStatus)) {
      throw Error(
        `Invalid requested status: ${requestedStatus}, expected one of ${defs.REQUESTED_STATUSES.join(", ")}`
      );
    }
    return requestedStatus as defs.RequestedStatus;
  },
  uploadMode: () => {
    const uploadMode = core.getInput("upload_mode");
    if (!utils.isIn(defs.UPLOAD_MODES, uploadMode)) {
      throw Error(`Invalid upload mode: ${uploadMode}, expected one of ${defs.UPLOAD_MODES.join(", ")}`);
    }
    return uploadMode as defs.UploadMode;
  },
});

export async function getMcVersions() {
  return await fetch(VERSION_MANIFEST_URL).then(async (res: Response) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    const json: { versions: { type: string; id: string }[] } = await res.json();
    return json.versions
      .filter((it: { type: string }) => it.type === "release")
      .map((it: { id: string }) => it.id)
      .reverse();
  });
}
