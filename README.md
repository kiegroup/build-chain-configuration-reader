# Build Chain Configuration Reader

This library reads configuration files for related project. This library is used by [github action build chain](https://github.com/marketplace/actions/github-action-build-chain-cross-repo-builds) tool for instance.

## Definition file structure

The definition file is basically composed by project dependencies information, default build/execution information and project build/execution information. Dependency information can be externalized in a different file in order to be reused by different build information files.
So the basic structure would be

```
version: "1.0"
dependencies: [url | relative file path | embedded dependencies in the same file]

default: [default build information]

build: [build information]
```

### project dependencies section structure

`dependencies`: it can be a `url`

#### URL format

it can be expressed like a simple url (http(s)://whateverurl.domain/whateverfile.txt) or it can be expressed using place holders like `https://raw.githubusercontent.com/${GROUP}/${PROJECT}/${BRANCH}/dependencies.yaml` to get `dependencies.yaml` file from source group, project and branch tokens (no need to use all of them at the same time).

**Place holders**
The place holders must be wrapped between `${}` expression and you can use any place holder you want.

### default section structure

### build configuration section structure

#### Tree node structure

See example here ![Tree Example](/docs/tree-example.json)

- project: [group/project]: contains the `group/project` information, where `group` is the repository group and `project` is the project name.
-

## Development

### Previous setup

You will need to run `export NPM_TOKEN=whatever_token` before being able to commit changes.

### Usefull API methods

- getTree: it returns back ![tree object](#tree-node)
- getTreeForProject: it returns back ![tree object](#tree-node) for a particular project (from this specific tree leaf)
- readDefinitionFile:
- parentChainFromNode:

### Restrictions

- Version **>=0.4.1**:
  - _NodeJS_ >= 7.6.0
- Version **<=0.4.0**:
  - _NodeJS_ >= 5.0.0

### copyright

Looks at all the .js files in the current git repo and adds/updates a
standard copyright notice to the top. The exact wording of the copyright
statement is based on the license declared in package.json, your git author
details, and the first and last commits made to a file (years only).
