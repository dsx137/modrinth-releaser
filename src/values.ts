import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";
import * as utils from "./utils";
import * as net from "./net";

export default nable.lazy({
  VERSION_MANIFEST_URL: () => "https://launchermeta.mojang.com/mc/game/version_manifest.json",
  MODRINTH_API: () => "https://api.modrinth.com/v2",
  token: () =>
    (process.env.MODRINTH_TOKEN ?? "").nAlso((it) => {
      if (nable.isEmpty(it)) throw new Error("Token is required");
    }),
  userAgent: () => `${github.context.repo.owner}/${github.context.repo.repo}/${github.context.sha}`,
  projectId: () => core.getInput("project_id"),
  versionNumber: () => core.getInput("version_number"),
  files: async () =>
    await core
      .getInput("files")
      .nLet((it) => nable.parseList(it))
      .nLet((it) => utils.matchFiles(it))
      .then((files) => files.map((file) => ({ name: path.basename(file), path: file } as defs.File))),
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
        const [project_id, dependency_type] = nable
          .parsePair(dep)
          .nLet((it) => [it[0], defs.validate(defs.DEPENDENCY_TYPES, it[1])]);
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
  versionType: () => core.getInput("version_type").nLet((it) => defs.validate(defs.VERSION_TYPES, it)),
  loaders: () =>
    core
      .getInput("loaders")
      .nLet((it) => nable.parseList(it))
      .map((it) => defs.validate(defs.LOADERS, it) as defs.Loader),
  featured: () => core.getBooleanInput("featured"),
  status: () => core.getInput("status").nLet((it) => defs.validate(defs.STATUSES, it)),
  requestedStatus: () => core.getInput("requested_status").nLet((it) => defs.validate(defs.REQUESTED_STATUSES, it)),
  uploadMode: () => {
    const [mode, addition] = core
      .getInput("upload_mode")
      .nLet((it) => defs.validate(defs.UPLOAD_MODES, it))
      .split(":")
      .map((it) => it.trim());
    return { mode, addition } as defs.UploadMode;
  },
});
