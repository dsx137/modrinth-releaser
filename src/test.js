const launcher_meta_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
const minecraft_versions = await fetch(launcher_meta_url).then(async (res) => {
    const json = await res.json();
    if (!res.ok) terminate(json)
    return json.versions.filter(it => it.type === "release").map(it => it.id);
});
console.log(minecraft_versions);