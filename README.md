# modrinth-upload-action

```yml
- name: Modrinth Release
uses: dsx137/modrinth-upload-action@main
env:
    MODRINTH_TOKEN: xxx
with:
    name: xxx
    project_id: puTJzCb0
    loaders: forge, fabric
    game_versions: 1.20.1, 1.20.2
    version_number: 1.1.0
    dependencies: >
        [
            {
            "project_id": "Vl1uNAuy",
            "dependency_type": "required"
            },{
            "project_id": "ordsPcFz",
            "dependency_type": "required"
            }
        ]
    files: |
        ./build/libs/*-all.jar
```
