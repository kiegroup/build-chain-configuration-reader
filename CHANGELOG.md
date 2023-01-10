# Changelog

# V3.0.8

- Add `@always` as valid `on` for archive artifact paths

# V3.0.7

- Fixed bug where children/parent fields of a node stored undefined node objects

# V3.0.6

- Added skip field

# V3.0.5

- Added clone field

# V3.0.0

- Refactoring to typescript
- new domain model and schema TS files provided

# V2.3.0

- extension mechanism for definition file

# V2.2.0

- mapping changes
- dependant section included
- eval expression allowed on mapping
- multiple mapping definition per project
- javascript expression in definition file URL
- placeholders replacement with default values
- [ISSUE 103] be able to access definition file from private repositories
- [ISSUE 168] dependencies.exclude on project-dependencies tests added
- getBaseBranch mechanism
- getBaseMappingInfo mechanism

# V2.1.0

- allow to pass token to file reading

# V2.0.3

- `merge` build-commands functionality

# V2.0.3

- error treatment improved

# V2.0.2

- error with dependencies loading fixed

# V2.0.1

- error with dependencies URLs fixed
- project precedence workaround

# V2.0.0

- way of defining mapping totally refactored

# V1.1.0

- dependency files extension

# V0.0.8

- possibility to interpret objects different to string on build configuration. Like skip: Boolean

# V0.0.7

- get full downstream list functionallity
- get ordered list for tree functionallity
- get ordered list for project functionallity

## Bugs:

- archive artifact names in case is not defined can contains `group/projectName` as a possible value.
