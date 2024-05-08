"use strict";
import core from "@actions/core";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import * as utils from "./utils.js";
import * as values from "./values.js";

const debug = false;

const baseData = utils.cleanObject({
  name: values.name,
  version_number: values.version_number,
  changelog: values.changelog,
  dependencies: JSON.parse(values.dependencies),
  game_versions: values.game_versions.split(", "),
  version_type: values.version_type.toLowerCase(),
  loaders: values.loaders.split(", "),
  featured: values.featured,
  status: values.status.toLowerCase(),
  requested_status: values.requested_status.toLowerCase()
});

function terminate(json) {
  if (debug) {
    console.error(json);
  } else {
    core.setFailed(JSON.stringify(json));
  }
}

function log(...message) {
  if (debug) {
    console.info(...message);
  } else {
    core.info(...message);
  }
}

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

    if (!res.ok) terminate()

    return json.find((version) => version.version_number === values.version_number);
  });
}

async function getFilesData() {
  const matchedFiles = await utils.matchFilesFromPatterns(utils.parseInputFiles(values.files));

  return matchedFiles.map((file) => {
    return { path: file, name: path.basename(file) };
  });
}

async function getUploadForm() {
  const filesData = await getFilesData()
  const file_parts = [];
  Object.entries(filesData).forEach(([index, file]) => {
    file_parts.push(file.name);
  });

  const data = { ...baseData, file_parts, project_id: values.project_id };

  const form = new FormData();
  form.append("data", JSON.stringify(data));
  Object.entries(filesData).forEach(([index, file]) => {
    form.append(file.name, fs.createReadStream(file.path));
  });

  return form;
}

const version = await getCurrentVersion();
if (version === undefined) {
  const form = await getUploadForm();
  await utils.methodFetch("POST", `/version`, getRequest(form.getHeaders(), form)).then(async (res) => {
    if (!res.ok) terminate(await res.json())
  });
} else {
  await utils.methodFetch("PATCH", `/version/${version.id}`, getRequest({ "Content-Type": "application/json" }, JSON.stringify(baseData))).then(async (res) => {
    if (!res.ok) terminate(await res.json())
  });

  const form = new FormData();
  form.append("data", JSON.stringify({}));
  Object.entries(await getFilesData()).forEach(([index, file]) => {
    form.append(file.name, fs.createReadStream(file.path));
  });
  await utils.methodFetch("POST", `/version/${version.id}/file`, getRequest(form.getHeaders(), form)).then(async (res) => {
    if (!res.ok) terminate(await res.json())
  });

  version.files.forEach(async (file) => {
    await utils.methodFetch("DELETE", `/version_file/${file.hashes.sha512}`, getRequest()).then(async (res) => {
      if (!res.ok) terminate(await res.json())
    });
  });
}
