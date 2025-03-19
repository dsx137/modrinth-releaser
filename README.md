# modrinth-releaser

```yml
# Simple
- name: Modrinth Release
  uses: dsx137/modrinth-releaser@main
  env:
      MODRINTH_TOKEN: xxx
  with:
      name: xxx
      project_id: puTJzCb0
      loaders: forge, fabric
      game_versions: 1.20.1:1.20.2
      version_number: 1.1.0
      files: |
          ./build/libs/*-all.jar
```

```yml
# Full
- name: Modrinth Release
  uses: dsx137/modrinth-releaser@main
  env:
      MODRINTH_TOKEN: xxx
  with:
      name: xxx
      project_id: puTJzCb0
      loaders: forge, fabric
      game_versions: 1.20.1:1.20.2 # 1.12.2:1.20.6 means version range
      version_number: 1.1.0
      files: |
          ./build/libs/*-all.jar
      dependencies: Vl1uNAuy:required, ordsPcFz:required
      changelog: some message # or file path. the file path enjoys a higher priority.
      version_type: release # or beta, alpha
      featured: false
      status: listed # or archived, draft, unlisted, scheduled, unknown
      requested_status: listed # or archived, draft, unlisted
      upload_mode: normal # or update:replace, update:keep
```
