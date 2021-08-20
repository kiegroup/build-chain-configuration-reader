# Build Chain Configuration Reader

This library reads configuration files for related project. This library is used by [github action build chain](https://github.com/marketplace/actions/github-action-build-chain-cross-repo-builds) tool for instance.

## Definition file structure

The definition file is basically composed by project dependencies information, default build/execution information and project build/execution information. Dependency information can be externalized in a different file in order to be reused by different build information files.
So the basic structure would be

```
version: "2.1"
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
          dependencies:
            default:
              - source: SOURCE_BRANCH_X
                target: TARGET_BRANCH_X
          dependant:
            default:
              - source: SOURCE_BRANCH_Y
                target: TARGET_BRANCH_Y
          exclude:
            - PROJECT_A
            - PROJECT_B
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

### Mapping

Additional it could be the case where not all the projects use the same target branch, then the mapping should be also specified for those projects. Let's suppose all the projects from the previous example use `main` as target branch but `kiegroup/lienzo-tests` uses `master`.

```
- project: kiegroup/lienzo-core
- project: kiegroup/lienzo-tests
  dependencies:
    - project: kiegroup/lienzo-core
  mapping:
    dependencies:
      default:
        - source: master
          target: main
    dependant:
      default:
        - source: master
          target: 7.x
- project: kiegroup/droolsjbpm-build-bootstrap
- project: kiegroup/drools
  dependencies:
    - project: kiegroup/lienzo-tests
```

Each project should define its mapping. So in this case `kiegroup/lienzo-tests` defines it will map all dependencies from `master` to `main`, and `kiegroup/lienzo-tests` will be mapped from `main` to `master`.

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
    - project: kiegroup/jbpm
  mapping:
    dependencies:
      default:
        - source: 7.x
          target: master
    dependant:
      default:
        - source: master
          target: 7.x
    exclude:
      - kiegroup/optaweb-employee-rostering
      - kiegroup/optaweb-vehicle-routing

- project: kiegroup/droolsjbpm-integration
  dependencies:
    - project: kiegroup/optaplanner
    - project: kiegroup/jbpm
    - project: kiegroup/kie-soup

- project: kiegroup/optaweb-employee-rostering
  dependencies:
    - project: kiegroup/optaplanner
  mapping:
    dependencies:
      default:
        - source: 7.x
          target: master
    dependant:
      default:
        - source: master
          target: 7.x
    exclude:
      - kiegroup/optaweb-vehicle-routing
      - kiegroup/optaplanner

- project: kiegroup/optaweb-vehicle-routing
  dependencies:
    - project: kiegroup/optaplanner
  mapping:
    dependencies:
      default:
        - source: 7.x
          target: master
    dependant:
      default:
        - source: master
          target: 7.x
    exclude:
      - kiegroup/optaweb-employee-rostering
      - kiegroup/optaplanner
```

#### targetExpression

It is possible to define `targetExpression` instead of target (you can define both, but `target` will be overwritten at runtime). `targetExpression` allows you to define a Javascript expression which is going to be evaluated at runtime by [eval function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval), output will be set to target. Just consider the variables you use on the expression should be available during eval execution.

**Available variables**

- `mapping`: will point to `mapping.dependencies.${project}` so you can for instance use `mapping.source` to get source value.
- whatever process.env variable
- in general whatever variable available in reader-util.js#treatMappingDependencies

##### Examples

Let's suppose we have a mapping like

```
- project: kiegroup/optaweb-vehicle-routing
  dependencies:
    - project: kiegroup/optaplanner
  mapping:
    dependencies:
      default:
        - source: 7.x
          targetExpression: "`${mapping.source}.y`"
      projectX:
        - source: ^((?!master).)*$
          targetExpression: "process.env.GITHUB_HEAD_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
      projecty:
        - source: master
          target: main
    dependant:
      default:
        - source: master
          target: 7.x
      projectx:
        - source: ^((?!master).)*$
          targetExpression: "2+3"
```

it will produce

```
- project: kiegroup/optaweb-vehicle-routing
  dependencies:
    - project: kiegroup/optaplanner
  mapping:
    dependencies:
      default:
        - source:source: 7.x
          target: 7.x.y
          targetExpression: "`${mapping.source}.y`"
      projectX:
        - source: ^((?!master).)*$
          target: # it depends on process.env.GITHUB_HEAD_REF value. if '1.x.y' -> '9.x.y'. if '3.x' -> '11.x..'. In case of failure it will produce undefined. So you have to be very carefull with what you define there.
          targetExpression: "process.env.GITHUB_HEAD_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
      projecty:
        - source: master
          target: main
    dependant:
      default:
        - source: master
          target: 7.x
      projectx:
        - source: ^((?!master).)*$
          target: 5
          targetExpression: "2+3"
```

#### URL format

it can be expressed like a simple url (http(s)://whateverurl.domain/whateverfile.txt) or it can be expressed using place holders like `https://raw.githubusercontent.com/${GROUP}/${PROJECT}/${BRANCH}/dependencies.yaml` to get `dependencies.yaml` file from source group, project and branch tokens (no need to use all of them at the same time).

**Place holders**

The place holders must be wrapped between `${}` expression and you can use any place holder you want.

**Javascript expressions**

It is possible to define javascript expressions wrapped by `%{}`. So for instance a definition file string like
`` https://raw.githubusercontent.com/kiegroup/droolsjbpm-build-bootstrap/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+7}.${n2}.${n3}`)}/.ci/pull-request-config.yml `` in case `GITHUB_BASE_REF` environment variable's value is `1.2.x`, the expression between `%{}` will be evaluated and final definition file will be `https://raw.githubusercontent.com/kiegroup/droolsjbpm-build-bootstrap/8.2.x/.ci/pull-request-config.yml`.

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
        merge: String[]
      current: String | List of Strings
      upstream: String | List of Strings
      downstream: String | List of Strings
      after:
        current: String | List of Strings
        upstream: String | List of Strings
        downstream: String | List of Strings
        merge: String[]
      merge: String[]
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

#### Merge

It is possible to define the `merge` mechanism for every section in the build-configuration. If you define `merge` in any section level, its children will be also merged following the same mechanism, so you can either:

- define `merge` in the upper level, all the children will follow same mechanism.
- define `merge` in the upper level and every children.
- define `merge` in any child.

> **Note**: The default `merge` value is [] which means specific project build configuration will overwrite default one.

> **Note**: duplicate commands will be respected.

##### Examples

**Example 1 (single upper level)**

```
default:
  build-command:
    current: mvn clean install
    after:
      current: rm -rf ./*

build:
  - project: kiegroup/kie-wb-common
    build-command:
      current: mvn deploy
      after:
        current: echo 'TEST1'
      merge: ['current']
```

it will produce

```
- project: kiegroup/kie-wb-common
    build-command:
      current: |
         mvn clean install
         mvn deploy
      after:
        current: echo 'TEST1'
```

**Example 2 (upper level children propagation)**

```
default:
  build-command:
    current: mvn clean install
    after:
      current: rm -rf ./*

build:
  - project: kiegroup/kie-wb-common
    build-command:
      current: mvn deploy
      after:
        current: echo 'TEST1'
      merge: ['after', 'current']
```

it will produce

```
- project: kiegroup/kie-wb-common
    build-command:
      current: |
         mvn clean install
         mvn deploy
      after:
        current: |
           rm -rf ./*
           echo 'TEST1'
```

**Example 3 (upper level different children propagation)**

```
default:
  build-command:
    current: mvn clean install
    after:
      current: rm -rf ./*

build:
  - project: kiegroup/kie-wb-common
    build-command:
      current: mvn deploy
      after:
        current: echo 'TEST1'
        merge: ['current']
```

it will produce

```
- project: kiegroup/kie-wb-common
    build-command:
      current: mvn deploy
      after:
        current: |
           rm -rf ./*
           echo 'TEST1'
```

## Development

### Installation

Just execute `npm install`

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
