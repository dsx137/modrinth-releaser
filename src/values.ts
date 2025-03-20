import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";
import * as utils from "./utils";
import * as net from "./net";

await nable.enableHof();

// 常量
export const VERSION_MANIFEST_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
export const MODRINTH_API = "https://api.modrinth.com/v2";

// 环境变量和上下文
export const API_TOKEN = process.env.MODRINTH_TOKEN ?? "";
export const USER_AGENT = `${github.context.repo.owner}/${github.context.repo.repo}/${github.context.sha}`;

// 从输入中获取的值
export const INPUTS = nable.lazy({
  projectId: () => core.getInput("project_id"),
  versionNumber: () => core.getInput("version_number"),
  files: async () =>
    await core
      .getInput("files")
      .nLet((it) => nable.parseList(it))
      .nLet((it) => utils.matchFiles(it))
      .then((files) => {
        return files.map((file) => {
          return { name: path.basename(file), path: file } as defs.File;
        });
      }),
  name: () => core.getInput("name"),
  changelog: () =>
    core.getInput("changelog").nLet((it) => {
      if (fs.existsSync(it)) {
        try {
          return fs.readFileSync(it, "utf-8").nAlso(() => core.notice("Changelog source: file"));
        } catch (error) {
          core.warning(`Failed to read changelog file: ${nable.getError(error)}`);
          core.notice("Changelog source: input");
        }
      } else {
        core.notice("Changelog source: input");
      }
      return it;
    }),
  dependencies: () =>
    core
      .getInput("dependencies")
      .nLet((it) => nable.parseList(it))
      .map((dep) => {
        const [project_id, dependency_type] = nable.parsePair(dep);
        if (!nable.isIn(defs.DEPENDENCY_TYPES, dependency_type)) {
          throw Error(`Invalid dependency type: ${dependency_type}`);
        }
        return { project_id, dependency_type } as defs.Dependency;
      }),
  gameVersions: async () => {
    const minecraftVersions = await net.getMcVersions();
    return core
      .getInput("game_versions")
      .nLet((it) => nable.parseList(it))
      .map((game_version) => {
        if (game_version.split(":").length === 1) {
          const index = minecraftVersions.indexOf(game_version);
          if (index === -1) throw Error(`Invalid minecraft version: ${game_version}`);
          return [game_version];
        } else {
          const [start_game_version, end_game_version] = nable.parsePair(game_version);
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
  versionType: () =>
    core.getInput("version_type").nAlso((it) => {
      if (!nable.isIn(defs.VERSION_TYPES, it)) {
        throw Error(`Invalid version type: ${it}, expected one of ${defs.VERSION_TYPES.join(", ")}`);
      }
    }) as defs.VersionType,
  loaders: () =>
    core
      .getInput("loaders")
      .nLet((it) => nable.parseList(it))
      .onEach((loader) => {
        if (!nable.isIn(defs.LOADERS, loader)) {
          throw Error(`Invalid loader: ${loader}, expected one of ${defs.LOADERS.join(", ")}`);
        }
      }) as defs.Loader[],
  featured: () => core.getBooleanInput("featured"),
  status: () =>
    core.getInput("status").nAlso((it) => {
      if (!nable.isIn(defs.STATUSES, it)) {
        throw Error(`Invalid status: ${it}, expected one of ${defs.STATUSES.join(", ")}`);
      }
    }) as defs.Status,
  requestedStatus: () =>
    core.getInput("requested_status").nAlso((it) => {
      if (!nable.isIn(defs.REQUESTED_STATUSES, it)) {
        throw Error(`Invalid requested status: ${it}, expected one of ${defs.REQUESTED_STATUSES.join(", ")}`);
      }
    }) as defs.RequestedStatus,
  uploadMode: () => {
    const [mode, addition] = core
      .getInput("upload_mode")
      .split(":")
      .map((it) => it.trim());
    if (!(mode in defs.UPLOAD_MODES)) {
      throw Error(`Invalid upload modeType: ${mode}, expected one of ${Object.keys(defs.UPLOAD_MODES).join(", ")}`);
    }
    const additions = defs.UPLOAD_MODES[mode as defs.UploadModeType];
    if (!nable.isIn(additions, addition)) {
      throw Error(`Invalid upload mode addition: ${addition}, expected one of ${additions.join(", ")}`);
    }
    return { mode, addition } as defs.UploadMode;
  },
});
