"use strict";
import core from "@actions/core";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import * as utils from "./utils.js";
import * as values from "./values.js";

const terminate = (json) => { core.setFailed(JSON.stringify(json)); process.exit(1); }

function getRequest(headers = {}, body = undefined) {
  return utils.cleanObject({
    headers: {
      "User-Agent": values.user_agent,
      "Authorization": values.api_token,
      ...headers
    },
    body: body
  })
}

async function getCurrentVersion() {
  return await utils.methodFetch("GET", `/project/${values.project_id}/version`, getRequest()).then(async (res) => {
    const json = await res.json();
    if (!res.ok) terminate(json)

    return json.find((version) => version.version_number === values.version_number);
  });
}

async function getFilesData() {
  const matchedFiles = await utils.matchFilesFromPatterns(utils.parseInputFiles(values.files));

  return matchedFiles.map((file) => {
    return { path: file, name: path.basename(file) };
  });
}

const dependencies = values.dependencies.split(',')
  .filter((dependency) => { return dependency != null && dependency != '' })
  .map((dependency) => {
    const [project_id, dependency_type] = dependency.split(':').map(it => it.trim());
    if (!['required', 'optional', 'incompatible', 'embedded'].includes(dependency_type)) {
      terminate(`Invalid dependency type: ${dependency_type}`)
    }
    return { project_id, dependency_type }
  });

const game_versions = [];
const launcher_meta_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
const minecraft_versions = await fetch(launcher_meta_url).then(async (res) => {
  const json = await res.json();
  if (!res.ok) terminate(json)
  return json.versions.filter(it => it.type === "release").map(it => it.id);
});
values.game_versions.split(',').map(it => it.trim())
  .forEach((game_version) => {
    const push_version = (v) => {
      if (minecraft_versions.includes(v)) game_versions.push({ v });
      else terminate(`Invalid minecraft version: ${v}`);
    }

    if (game_version.split(':').length === 1) {
      push_version(game_version);
    } else {
      const [start_game_version, end_game_version] = game_version.split(':').map(it => it.trim());
      const start_index = minecraft_versions.indexOf(start_game_version);
      const end_index = minecraft_versions.indexOf(end_game_version);
      if (start_index === -1) terminate(`Invalid minecraft start version: ${start_game_version}`)
      if (end_index === -1) terminate(`Invalid minecraft end version: ${end_game_version}`)
      if (start_index > end_index) terminate(`Start version is greater than end version: ${game_version}`)
      for (let i = start_index; i <= end_index; i++) {
        push_version(minecraft_versions[i]);
      }
    }
  });

const baseData = utils.cleanObject({
  name: values.name,
  version_number: values.version_number,
  changelog: values.changelog,
  dependencies,
  game_versions,
  version_type: values.version_type.toLowerCase(),
  loaders: values.loaders.split(',').map(it => it.trim()),
  featured: values.featured,
  status: values.status.toLowerCase(),
  requested_status: values.requested_status.toLowerCase()
});

const filesData = await getFilesData()
const file_parts = [];
Object.entries(filesData).forEach(([index, file]) => {
  file_parts.push(file.name);
});
core.info(`Files to upload: ${file_parts.join(", ")}`);

const version = await getCurrentVersion();
if (version === undefined) {
  core.info("Creating new version...");

  const data = { ...baseData, file_parts, project_id: values.project_id };

  const form = new FormData();
  form.append("data", JSON.stringify(data));
  Object.entries(filesData).forEach(([index, file]) => {
    form.append(file.name, fs.createReadStream(file.path));
  });

  utils.methodFetch("POST", `/version`, getRequest(form.getHeaders(), form)).then(async (res) => {
    if (!res.ok) terminate(await res.json())
    core.info("Version created successfully!");
  });
} else {
  core.info("Updating existing version...");
  utils.methodFetch("PATCH", `/version/${version.id}`, getRequest({ "Content-Type": "application/json" }, JSON.stringify(baseData))).then(async (res) => {
    if (!res.ok) terminate(await res.json())
    core.info("Version updated successfully!");

    const form = new FormData();
    form.append("data", JSON.stringify({}));
    Object.entries(filesData).forEach(([index, file]) => {
      form.append(file.name, fs.createReadStream(file.path));
    });
    core.info("Uploading new files...");
    utils.methodFetch("POST", `/version/${version.id}/file`, getRequest(form.getHeaders(), form)).then(async (res) => {
      if (!res.ok) terminate(await res.json())
      core.info("Files uploaded successfully!");

      if (values.delete_files_if_exists) {
        core.info("Deleting old files...");
        version.files.forEach(async (file) => {
          utils.methodFetch("DELETE", `/version_file/${file.hashes.sha512}`, getRequest()).then(async (res) => {
            if (!res.ok) terminate(await res.json())
            core.info("File deleted successfully!");
          });
        });
      }
    });
  });
}
