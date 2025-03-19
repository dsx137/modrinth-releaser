"use strict";
import FormData from "form-data";
import * as core from "@actions/core";
import * as fs from "fs";
import * as utils from "./utils";
import * as values from "./values";
import * as defs from "./defs";
import * as net from "./net";

export async function findVersion(projectId: string, versionNumber: string) {
  return core.group(`🔍 Find version [${versionNumber}]`, async () => {
    return await net
      .fetchToModrinth("GET", `/project/${projectId}/version`)
      .then(async (res) => {
        if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
        return (await res.json()) as defs.Version[];
      })
      .then((versions) => versions.find((version) => version.version_number === versionNumber));
  });
}

export async function createVersion(data: defs.DataRequestCreateVersion, files: defs.File[]) {
  await core.group(`🆕 Create version with [${files.length}] files`, async () => {
    core.info(`Files to upload: \n\t${files.map((it) => it.name).join("\n\t")}`);

    const form = new FormData();
    form.append("data", JSON.stringify(data));
    files.forEach((file) => form.append(file.name, fs.createReadStream(file.path)));

    await net.fetchToModrinth("POST", `/version`, form.getHeaders(), form).then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
      core.info("Version created successfully!");
    });
  });
}

export async function modifyVersion(versionId: string, data: defs.DataRequestModifyVersion) {
  await core.group(`🔄 Modify version [${versionId}]`, async () => {
    await net
      .fetchToModrinth("PATCH", `/version/${versionId}`, { "Content-Type": "application/json" }, JSON.stringify(data))
      .then(async (res) => {
        if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
        core.info("Version modified successfully!");
      });
  });
}

export async function addFilesToVersion(versionId: string, files: defs.File[]) {
  await core.group(`📤 Add [${files.length}] files to version`, async () => {
    core.info(`Files to upload: \n\t${files.map((it) => it.name).join("\n\t")}`);

    const file_parts = files.map((it) => it.name);

    const form = new FormData();
    form.append(
      "data",
      JSON.stringify({
        ...utils.trimObject({
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
        }),
        file_parts,
      })
    );
    files.forEach((file) => form.append(file.name, fs.createReadStream(file.path)));

    core.info("Uploading new files...");
    await net.fetchToModrinth("POST", `/version/${versionId}/file`, form.getHeaders(), form).then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
      core.info("Files added successfully!");
    });
  });
}

export async function deleteVersionFiles(files: defs.VersionFile[]) {
  await core.group(`🗑️ Delete [${files.length}] version files`, async () => {
    await Promise.all(
      files.map(
        async (file) =>
          await net.fetchToModrinth("DELETE", `/version_file/${file.hashes.sha512}`).then(async (res) => {
            if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
            core.info("File deleted: " + file.filename);
          })
      )
    );
  });
}

export async function main() {
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
  const uploadMode = values.INPUTS.uploadMode;

  const version = await findVersion(values.INPUTS.projectId, values.INPUTS.versionNumber);
  if (utils.isNil(version)) {
    await createVersion(
      { ...baseData, file_parts: files.map((it) => it.name), project_id: values.INPUTS.projectId },
      files
    );
    return;
  }

  switch (uploadMode.mode) {
    case "unique":
      core.notice("Version already exists. Skipping...");
      break;
    case "update":
      await modifyVersion(version.id, baseData);
      await addFilesToVersion(version.id, files);

      switch (uploadMode.addition) {
        case "replace":
          if (version.files.length === 0) {
            core.notice("No files to delete.");
          } else {
            await deleteVersionFiles(version.files);
          }
          break;
        case "keep":
          core.notice("Old files will be kept.");
          break;
        default:
          throw Error(`Invalid upload mode addition: ${uploadMode.addition}`);
      }
      break;
    default:
      throw Error(`Invalid upload mode: ${uploadMode.mode}`);
  }
}

await main()
  .then(() => core.info("✅️ Done!"))
  .catch((error) => {
    core.setFailed("❌️ " + utils.getError(error));
    process.exit(1);
  });
