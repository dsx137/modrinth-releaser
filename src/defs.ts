export enum DEPENDENCY_TYPES {
  "required",
  "optional",
  "incompatible",
  "embedded",
}
export enum REQUESTED_STATUSES {
  "listed",
  "archived",
  "draft",
  "unlisted",
}
export enum STATUSES {
  "listed",
  "archived",
  "draft",
  "unlisted",
  "scheduled",
  "unknown",
}
export enum LOADERS {
  "bukkit",
  "bungeecord",
  "canvas",
  "datapack",
  "fabric",
  "folia",
  "forge",
  "iris",
  "liteloader",
  "minecraft",
  "modloader",
  "neoforge",
  "optifine",
  "paper",
  "purpur",
  "quilt",
  "rift",
  "spigot",
  "sponge",
  "vanilla",
  "velocity",
  "waterfall",
}
export enum VERSION_TYPES {
  "release",
  "beta",
  "alpha",
}
export enum FILE_TYPES {
  "required-resource-pack",
  "optional-resource-pack",
}
export enum ALGORITHMS {
  "sha1",
  "sha512",
}

export type DependencyType = keyof typeof DEPENDENCY_TYPES;
export type RequestedStatus = keyof typeof REQUESTED_STATUSES;
export type Status = keyof typeof STATUSES;
export type Loader = keyof typeof LOADERS;
export type VersionType = keyof typeof VERSION_TYPES;
export type FileType = keyof typeof FILE_TYPES;
export type Algorithm = keyof typeof ALGORITHMS;

export enum UPLOAD_MODES {
  "unique",
  "update:replace",
  "update:keep",
}

export type UploadMode = {
  mode: string;
  addition: string;
};

export function validate<T extends object>(def: T, it: string): keyof T {
  if (!(it in def)) {
    throw Error(`Invalid value: ${it}, expected one of ${Object.keys(def).join(", ")}`);
  }
  return it as keyof T;
}

export type File = {
  name: string;
  path: string;
};

export type VersionFile = {
  hashes: { sha512: string };
  filename: string;
};

export type Version = {
  id: string;
  version_number: string;
  files: VersionFile[];
};

export type Dependency = {
  project_id: string;
  dependency_type: DependencyType;
};

export type DataRequestCreateVersion = {
  name?: string; // The name of this version
  version_number?: string; // The version number. Ideally will follow semantic versioning
  changelog?: string; // The changelog for this version
  dependencies?: Dependency[]; // A list of specific versions of projects that this version depends on
  game_versions?: string[]; // A list of versions of Minecraft that this version supports
  version_type?: VersionType; // The release channel for this version
  loaders?: Loader[]; // The mod loaders that this version supports. In case of resource packs, use “minecraft”
  featured?: boolean; // Whether the version is featured or not
  status?: Status; // Status of the version
  requested_status?: RequestedStatus; // Requested status change for the version
  project_id: string; // The ID of the project this version is for
  file_parts: string[]; // An array of the multipart field names of each file that goes with this version
  primary_file?: string; // The multipart field name of the primary file
};

export type DataRequestModifyVersion = {
  name?: string; // The name of this version
  version_number?: string; // The version number. Ideally will follow semantic versioning
  changelog?: string; // The changelog for this version
  dependencies?: Dependency[]; // A list of specific versions of projects that this version depends on
  game_versions?: string[]; // A list of versions of Minecraft that this version supports
  version_type?: VersionType; // The release channel for this version
  loaders?: Loader[]; // The mod loaders that this version supports. In case of resource packs, use “minecraft”
  featured?: boolean; // Whether the version is featured or not
  status?: Status; // Status of the version
  requested_status?: RequestedStatus; // Requested status change for the version
  primary_file?: [algorithm: Algorithm, hash: string]; // The hash format and the hash of the new primary file
  file_types?: { algorithm: Algorithm; hash: string; file_type: FileType }; // A list of file_types to edit
};
