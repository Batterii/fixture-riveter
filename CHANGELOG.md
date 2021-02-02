# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- ObjectionAdapter: only call delete on instances that might be in the database,
    and wrap call in a try-catch for when we call it on instances that were
    constructed with `build`.
- Move all default build method overloads to separate interfaces
- Change `fixture#run` to `fixture#prepare`
- Revert `_methodMissing` back to `methodMissing`
- Enforce RelationAttribute fixture property being only an array
- Clean up eslint rules, update @batterii/eslint-config-ts


## [v2.0.0] - 2021-01-29
### Added
- Expanded GUIDE

### Changed
- Convert `association` to `relation` to match Objection.js and TypeORM naming
- Throw an error in `optionsParser` if given incorrect options
- Change `fixture:` option to allow string array to match [factory_bot] specification


## [v1.7.0] - 2021-01-28
### Changed
- Make Sequence generic on `next` return type

### Fixed
- Decouple inline sequences and globals as intended so internal sequences can
    share a name with global sequences

### Removed
- Inline sequences can't specify aliases


## [v1.6.0] - 2021-01-28
### Added
- FixtureRiveter and DefinitionProxy `sequence` method overloads
- FixtureRiveter `run`, `runList`, and `registerStrategy` method overloads
- SequenceHandler `registerSequence` method overloads
- `numberGen` and `stringGen` generators for use in Sequence

### Changed
- Callback return `void` or `Promise<void>`
- `methodMissing` is now `_methodMissing` to further hide it
- Add `fixture` option to `override` argument of `associate` methods
- Rewrite FixtureRiveter's `run` method to enforce internal types
- Completely rewrite Sequence to rely on generators instead of subclasses
- Use implementation of Ruby's `String#succ` method for string sequence
- Change Strategy base class to be concrete (stub implementation is same as
    attributeFor)

### Removed
- Remove IntegerSequence and StringSequence
- Disallow defining multiple fixtures with the same name or aliases
- Disallow defining multiple global sequences or sequences within a given
    fixture with the same name or aliases


## [v1.5.0] - 2021-01-24
### Added
- FixtureRiveter `fixtuer` method overloads


## [v1.4.0] - 2021-01-22
### Changed
- ObjectionAdapter calls `insertFetch` on save
- ObjectionAdapter's `associate` properly sets the ids of both instances


## [v1.3.0] - 2021-01-21
### Added
- Add typed overloads to DefinitionProxy methods `attr` and `association`
- Add typed overloads to Evaluator method `association`
- Allow fixture definitions to accept just a Model, deriving the fixture name
    implicitly

### Changed
- Rename callbackFunction type to CallbackFunction
- Change DefinitionProxy and Evaluator `attr` and implicit attribute methods to
    properly type when they're attributes and when they're associations

### Fixed
- Readd source-map-support, oops


## [v1.2.0] - 2021-01-20
### Fixed
- Include model properties in callback evaluator props

### Removed
- Remove unnecessary dev dependencies


## [v1.1.0] - 2021-01-19
### Changed
- Make callbacks generic
- Change input types of DefinitionProxy and Evaluator blocks to better match API


## [v1.0.3] - 2021-01-19
### Changed
- Make adapter methods generic
- Explicitly type internal methods
- Add method overloads to DefinitionProxy methods
- Type DefinitionProxy methods


## [v1.0.2] - 2021-01-19
### Changed
- Switch strategy tubs to using helper types for consistency


## [v1.0.1] - 2021-01-19
### Fixed
- Change `fr.create` method to return an array instead of a tuple


## [v1.0.0] - 2021-01-15
### Added
- CI with CircleCI

### Changed
- Type block functions for fixture and trait definitions
- Update arguments to stub strategy methods, fully type arguments and return


## [v0.4.0] - 2020-09-17
### Added
- Add destroy method to adapters, allowing for ORM-specific clean up
- Add cleanUp method to fr, which calls `delete` on all instances

### Changed
- Update arguments to stub strategy methods, basic types


## [v0.3.0] - 2020-07-22
### Changed
- Make ObjectionAdapter upsert missing models


## [v0.2.0] - 2020-07-22
## Added
- Add nested fixtures to guide
- Write tests that cover code in guide
- Allow transients to call properties by method

### Fixed
- Create a lexical scope for traits to fix [factory_bot] bug


## [v0.1.2] - 2020-07-09
### Changed
- Fix repo url in package.json


## [v0.1.1] - 2020-07-09
### Changed
- Moved tutorial to docs/GUIDE.md, expanded it


## [v0.1.0] - 2020-07-09
### Added
- Barebones release of Fixture Riveter: fixtures, traits, associations
- Barebones tutorial

[Unreleased]: https://github.com/Batteri/fixture-riveter/compare/v2.0.0...HEAD
[v2.0.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v2.0.0
[v1.7.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.7.0
[v1.6.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.6.0
[v1.5.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.5.0
[v1.4.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.4.0
[v1.3.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.3.0
[v1.2.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.2.0
[v1.1.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.1.0
[v1.0.2]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.0.3
[v1.0.2]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.0.2
[v1.0.1]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.0.1
[v1.0.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v1.0.0
[v0.4.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.4.0
[v0.3.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.3.0
[v0.2.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.2.0
[v0.1.2]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.1.2
[v0.1.1]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.1.1
[v0.1.0]: https://github.com/Batterii/fixture-riveter/releases/tag/v0.1.0
[factory_bot]: https://github.com/thoughtbot/factory_bot