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

```
dependencies:
  - project: PROJECT_NAME
    dependencies:
      - project: PROJECT_NAME
        mapping:
          source: SOURCE_BRANCH
          target: TARGET_BRANCH
```

You should define a list of projects like

```
- project: kiegroup/lienzo-core
- project: kiegroup/lienzo-tests
- project: kiegroup/droolsjbpm-build-bootstrap
- project: kiegroup/drools
```

and stablish their dependencies with each other

```
- project: kiegroup/lienzo-core
- project: kiegroup/lienzo-tests
  dependencies:
    - project: kiegroup/lienzo-core
- project: kiegroup/droolsjbpm-build-bootstrap
- project: kiegroup/drools
  dependencies:
    - project: kiegroup/lienzo-tests
```

Additional it could be the case where not all the projects use the same target branch, then the mapping should be also specified for those projects. Let's suppose all the projects from the previous example use `main` as target branch but `kiegroup/lienzo-tests` uses `master`.

```
- project: kiegroup/lienzo-core
- project: kiegroup/lienzo-tests
  dependencies:
    - project: kiegroup/lienzo-core
      mapping:
        source: main
        target: master
- project: kiegroup/droolsjbpm-build-bootstrap
- project: kiegroup/drools
  dependencies:
    - project: kiegroup/lienzo-tests
      mapping:
        source: master
        target: main
```

There are two mappings, one for `lienzo-tests - lienzo-core` where the mapping from `main` to `master` is specified. The other one between `drools - lienzo-tests` where the opposite mapping is defined as `master` to `main`.

**Example:**

```
- project: kiegroup/lienzo-core

- project: kiegroup/lienzo-tests
  dependencies:
    - project: kiegroup/lienzo-core

- project: kiegroup/droolsjbpm-build-bootstrap

- project: kiegroup/kie-soup
  dependencies:
    - project: kiegroup/droolsjbpm-build-bootstrap

- project: kiegroup/drools
  dependencies:
    - project: kiegroup/kie-soup

- project: kiegroup/jbpm
  dependencies:
    - project: kiegroup/drools
    - project: kiegroup/kie-soup

- project: kiegroup/optaplanner
  dependencies:
    - project: kiegroup/drools
      mapping:
        source: 7.x
        target: master
    - project: kiegroup/jbpm
      mapping:
        source: 7.x
        target: master

- project: kiegroup/droolsjbpm-integration
  dependencies:
    - project: kiegroup/optaplanner
      mapping:
        source: master
        target: 7.x
    - project: kiegroup/jbpm
    - project: kiegroup/kie-soup
```

#### URL format

it can be expressed like a simple url (http(s)://whateverurl.domain/whateverfile.txt) or it can be expressed using place holders like `https://raw.githubusercontent.com/${GROUP}/${PROJECT}/${BRANCH}/dependencies.yaml` to get `dependencies.yaml` file from source group, project and branch tokens (no need to use all of them at the same time).

**Place holders**
The place holders must be wrapped between `${}` expression and you can use any place holder you want.

### default section structure

### build configuration section structure

```
build:
  - project: PROJECT_NAME
    build-command:
      before:
        current: String | List of Strings
        upstream: String | List of Strings
        downstream: String | List of Strings
      current: String | List of Strings
      upstream: String | List of Strings
      downstream: String | List of Strings
      after:
        current: String | List of Strings
        upstream: String | List of Strings
        downstream: String | List of Strings
    skip: true
    archive-artifacts:
      name: String
      path*: String | List of Strings
      if-no-files-found (default:warn): warn|ignore|error
      dependencies (default:none): all|none|list of project names
```

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
- getOrderedListForTree: it returns back a plain list ordered by precedence for the whole tree.
- getOrderedListForProject: it returns back a plain list ordered by precedence for a specifi project.
- readDefinitionFile: It will return back the definition file plus dependencies as an object
- parentChainFromNode: it generates an ordered array of node's parents from top to bottom

### Restrictions

- _NodeJS_ >= 10.x

### copyright

Looks at all the .js files in the current git repo and adds/updates a
standard copyright notice to the top. The exact wording of the copyright
statement is based on the license declared in package.json, your git author
details, and the first and last commits made to a file (years only).
