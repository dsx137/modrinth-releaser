export var DEPENDENCY_TYPES;
(function (DEPENDENCY_TYPES) {
    DEPENDENCY_TYPES[DEPENDENCY_TYPES["required"] = 0] = "required";
    DEPENDENCY_TYPES[DEPENDENCY_TYPES["optional"] = 1] = "optional";
    DEPENDENCY_TYPES[DEPENDENCY_TYPES["incompatible"] = 2] = "incompatible";
    DEPENDENCY_TYPES[DEPENDENCY_TYPES["embedded"] = 3] = "embedded";
})(DEPENDENCY_TYPES || (DEPENDENCY_TYPES = {}));
export var REQUESTED_STATUSES;
(function (REQUESTED_STATUSES) {
    REQUESTED_STATUSES[REQUESTED_STATUSES["listed"] = 0] = "listed";
    REQUESTED_STATUSES[REQUESTED_STATUSES["archived"] = 1] = "archived";
    REQUESTED_STATUSES[REQUESTED_STATUSES["draft"] = 2] = "draft";
    REQUESTED_STATUSES[REQUESTED_STATUSES["unlisted"] = 3] = "unlisted";
})(REQUESTED_STATUSES || (REQUESTED_STATUSES = {}));
export var STATUSES;
(function (STATUSES) {
    STATUSES[STATUSES["listed"] = 0] = "listed";
    STATUSES[STATUSES["archived"] = 1] = "archived";
    STATUSES[STATUSES["draft"] = 2] = "draft";
    STATUSES[STATUSES["unlisted"] = 3] = "unlisted";
    STATUSES[STATUSES["scheduled"] = 4] = "scheduled";
    STATUSES[STATUSES["unknown"] = 5] = "unknown";
})(STATUSES || (STATUSES = {}));
export var LOADERS;
(function (LOADERS) {
    LOADERS[LOADERS["bukkit"] = 0] = "bukkit";
    LOADERS[LOADERS["bungeecord"] = 1] = "bungeecord";
    LOADERS[LOADERS["canvas"] = 2] = "canvas";
    LOADERS[LOADERS["datapack"] = 3] = "datapack";
    LOADERS[LOADERS["fabric"] = 4] = "fabric";
    LOADERS[LOADERS["folia"] = 5] = "folia";
    LOADERS[LOADERS["forge"] = 6] = "forge";
    LOADERS[LOADERS["iris"] = 7] = "iris";
    LOADERS[LOADERS["liteloader"] = 8] = "liteloader";
    LOADERS[LOADERS["minecraft"] = 9] = "minecraft";
    LOADERS[LOADERS["modloader"] = 10] = "modloader";
    LOADERS[LOADERS["neoforge"] = 11] = "neoforge";
    LOADERS[LOADERS["optifine"] = 12] = "optifine";
    LOADERS[LOADERS["paper"] = 13] = "paper";
    LOADERS[LOADERS["purpur"] = 14] = "purpur";
    LOADERS[LOADERS["quilt"] = 15] = "quilt";
    LOADERS[LOADERS["rift"] = 16] = "rift";
    LOADERS[LOADERS["spigot"] = 17] = "spigot";
    LOADERS[LOADERS["sponge"] = 18] = "sponge";
    LOADERS[LOADERS["vanilla"] = 19] = "vanilla";
    LOADERS[LOADERS["velocity"] = 20] = "velocity";
    LOADERS[LOADERS["waterfall"] = 21] = "waterfall";
})(LOADERS || (LOADERS = {}));
export var VERSION_TYPES;
(function (VERSION_TYPES) {
    VERSION_TYPES[VERSION_TYPES["release"] = 0] = "release";
    VERSION_TYPES[VERSION_TYPES["beta"] = 1] = "beta";
    VERSION_TYPES[VERSION_TYPES["alpha"] = 2] = "alpha";
})(VERSION_TYPES || (VERSION_TYPES = {}));
export var FILE_TYPES;
(function (FILE_TYPES) {
    FILE_TYPES[FILE_TYPES["required-resource-pack"] = 0] = "required-resource-pack";
    FILE_TYPES[FILE_TYPES["optional-resource-pack"] = 1] = "optional-resource-pack";
})(FILE_TYPES || (FILE_TYPES = {}));
export var ALGORITHMS;
(function (ALGORITHMS) {
    ALGORITHMS[ALGORITHMS["sha1"] = 0] = "sha1";
    ALGORITHMS[ALGORITHMS["sha512"] = 1] = "sha512";
})(ALGORITHMS || (ALGORITHMS = {}));
export var UPLOAD_MODES;
(function (UPLOAD_MODES) {
    UPLOAD_MODES[UPLOAD_MODES["unique"] = 0] = "unique";
    UPLOAD_MODES[UPLOAD_MODES["update:replace"] = 1] = "update:replace";
    UPLOAD_MODES[UPLOAD_MODES["update:keep"] = 2] = "update:keep";
})(UPLOAD_MODES || (UPLOAD_MODES = {}));
export function validate(def, it) {
    if (!(it in def)) {
        throw Error(`Invalid value: ${it}, expected one of ${Object.keys(def).join(", ")}`);
    }
    return it;
}
