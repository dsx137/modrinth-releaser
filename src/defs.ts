export const DEPENDENCY_TYPES = ["required", "optional", "incompatible", "embedded"] as const;
export const REQUESTED_STATUSES = ["listed", "archived", "draft", "unlisted"] as const;
export const STATUSES = ["listed", "archived", "draft", "unlisted", "scheduled", "unknown"] as const;
export const LOADERS = [
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
] as const;
export const VERSION_TYPES = ["release", "beta", "alpha"] as const;
export const FILE_TYPES = ["required-resource-pack", "optional-resource-pack"] as const;
export const ALGORITHMS = ["sha1", "sha512"] as const;

export type DependencyType = (typeof DEPENDENCY_TYPES)[number];
export type RequestedStatus = (typeof REQUESTED_STATUSES)[number];
export type Status = (typeof STATUSES)[number];
export type Loader = (typeof LOADERS)[number];
export type VersionType = (typeof VERSION_TYPES)[number];
export type FileType = (typeof FILE_TYPES)[number];
export type Algorithm = (typeof ALGORITHMS)[number];

export const UPLOAD_MODES = { unique: [undefined], update: ["replace", "keep"] } as const;
export type UploadModeType = keyof typeof UPLOAD_MODES;
export type UploadModeAddition<T extends UploadModeType> = (typeof UPLOAD_MODES)[T][number];

export type UploadMode<T extends UploadModeType = UploadModeType> = {
  mode: T;
  addition: UploadModeAddition<T>;
};

export interface File {
  name: string;
  path: string;
}

export interface VersionFile {
  hashes: { sha512: string };
  filename: string;
}

export interface Version {
  id: string;
  version_number: string;
  files: VersionFile[];
}

export interface Dependency {
  project_id: string;
  dependency_type: DependencyType;
}

export interface DataRequestCreateVersion {
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
}

export interface DataRequestModifyVersion {
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
}
