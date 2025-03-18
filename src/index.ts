"use strict";
import * as core from "@actions/core";
import * as FormData from "form-data";
import * as fs from "fs";
import * as utils from "./utils";
import * as values from "./values";
import * as defs from "./defs";
import * as net from "./net";

async function listVersions() {
  return await net.fetchToModrinth("GET", `/project/${values.INPUTS.projectId}/version`).then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    return (await res.json()) as defs.Version[];
  });
}

async function createVersion(data: defs.DataRequestCreateVersion, files: defs.File[]) {
  core.info("Creating new version...");

  const form = new FormData();
  form.append("data", JSON.stringify(data));
  files.forEach((file) => {
    form.append(file.name, fs.createReadStream(file.path));
  });

  await net.fetchToModrinth("POST", `/version`, form.getHeaders(), form).then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    core.info("Version created successfully!");
  });
}

async function modifyVersion(versionId: string, data: defs.DataRequestModifyVersion) {
  core.info("Modifying existing version...");
  await net
    .fetchToModrinth("PATCH", `/version/${versionId}`, { "Content-Type": "application/json" }, JSON.stringify(data))
    .then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${res.body}`);
      core.info("Version modified successfully!");
    });
}

async function addFilesToVersion(versionId: string, files: defs.File[]) {
  core.info("Adding files to version...");
  const form = new FormData();
  // form.append("data", JSON.stringify({}));
  files.forEach((file) => {
    form.append(file.name, fs.createReadStream(file.path));
  });

  core.info("Uploading new files...");
  await net.fetchToModrinth("POST", `/version/${versionId}/file`, form.getHeaders(), form).then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    core.info("Files added successfully!");
  });
}

async function deleteVersionFile(file: defs.VersionFile) {
  await net.fetchToModrinth("DELETE", `/version_file/${file.hashes.sha512}`).then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${res.body}`);
    core.info("File deleted: " + file.filename);
  });
}

async function main() {
  // 基础数据
  const baseData = utils.trimObject({
    name: values.INPUTS.name,
    version_number: values.INPUTS.versionNumber,
    changelog: values.INPUTS.changelog,
    dependencies: values.INPUTS.dependencies,
    game_versions: await values.INPUTS.gameVersions,
    version_type: values.INPUTS.versionType,
    loaders: values.INPUTS.loaders,
    featured: values.INPUTS.featured,
    status: values.INPUTS.status,
    requested_status: values.INPUTS.requestedStatus,
  });

  const files = await values.INPUTS.files;
  const file_parts = files.map((it) => it.name);

  core.info(`Files to upload: \n\t${file_parts.join("\n\t")}\n`);

  const version = await listVersions().then((versions) =>
    versions.find((version) => version.version_number === values.INPUTS.versionNumber)
  );
  if (utils.isNil(version)) {
    await createVersion({ ...baseData, file_parts, project_id: values.INPUTS.projectId }, files);
    return;
  }

  if (values.INPUTS.uploadMode === "normal") {
    core.info("Version already exists and updatable is false. Skipping...");
    return;
  }

  const [uploadMode, uploadModeAddition] = utils.parsePair(values.INPUTS.uploadMode);

  if (uploadMode === "update") {
    await modifyVersion(version.id, baseData);
    await addFilesToVersion(version.id, files);

    switch (uploadModeAddition) {
      case "replace":
        if (version.files.length === 0) {
          core.info("No files to replace.");
        } else {
          core.info("Deleting old files...");
          version.files.forEach(async (file) => await deleteVersionFile(file));
        }
        break;
      case "keep":
        core.info("Old files will be kept.");
        break;
      default:
        throw Error(`Invalid upload mode addition: ${uploadModeAddition}`);
    }
    return;
  }
}

await main()
  .then(() => core.info("Done!"))
  .catch((error) => {
    core.setFailed(error.message);
    process.exit(1);
  });
