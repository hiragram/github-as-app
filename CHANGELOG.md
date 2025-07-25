# Changelog

## [0.5.1](https://github.com/hiragram/github-as-app/compare/v0.5.0...v0.5.1) (2025-07-18)


### Bug Fixes

* **env:** Fix environment variable check to support BOT_GITHUB_ prefix ([91664d1](https://github.com/hiragram/github-as-app/commit/91664d171d08e583517f74411c1d1a7bf3f0b95a))

## [0.5.0](https://github.com/hiragram/github-as-app/compare/v0.4.0...v0.5.0) (2025-07-16)


### Features

* **comments:** Add tools to update existing issue and PR comments ([0ab3c87](https://github.com/hiragram/github-as-app/commit/0ab3c87c53e998b8279335c8af72f2eb69bf6774))
* **env:** Support BOT_GITHUB_ prefix for GitHub Actions compatibility ([c24a869](https://github.com/hiragram/github-as-app/commit/c24a8696aebdd23f3d39aa582edd56e7ff279c19))


### Bug Fixes

* **repository:** Fix git commit command execution for complex messages ([a2705cd](https://github.com/hiragram/github-as-app/commit/a2705cd2e04cd21d4401c4a2a5a28a5d3c5f0ee2))

## [0.4.0](https://github.com/hiragram/github-as-app/compare/v0.3.0...v0.4.0) (2025-07-06)


### Features

* **identity:** Add get_identity tool to retrieve GitHub App information ([6b03172](https://github.com/hiragram/github-as-app/commit/6b03172f22c9fc226d508e9ecb3bad3c3f7ddd6a))

## [0.3.0](https://github.com/hiragram/github-as-app/compare/v0.2.2...v0.3.0) (2025-07-06)


### ⚠ BREAKING CHANGES

* create_commit tool renamed to git_commit with different API

### Miscellaneous Chores

* release 0.3.0 ([5e1dcda](https://github.com/hiragram/github-as-app/commit/5e1dcdaaca0435813fefb8215d082d75a3169cbb))


### Code Refactoring

* Simplify git_commit tool to wrap git command ([ab6f19b](https://github.com/hiragram/github-as-app/commit/ab6f19bfc98acfd5f57db34c9f704f6f2053b12f))

## [0.2.2](https://github.com/hiragram/github-as-app/compare/v0.2.1...v0.2.2) (2025-07-05)


### Bug Fixes

* Add Octokit v15 compatibility with request method wrappers ([c895527](https://github.com/hiragram/github-as-app/commit/c895527bc252aaac5c5f9e5833858e52ea1cc6e8))
* Add Octokit v15 compatibility with request method wrappers ([51df03c](https://github.com/hiragram/github-as-app/commit/51df03c2396b3216128bea5df8965351b14f1fbe))
* Fix tool name routing logic ([36b8987](https://github.com/hiragram/github-as-app/commit/36b89870738bf5f1224602db0f6c5d3c81d22a44))

## [0.2.1](https://github.com/hiragram/github-as-app/compare/v0.2.0...v0.2.1) (2025-07-05)


### Bug Fixes

* Consolidate release and publish workflows ([9bb158d](https://github.com/hiragram/github-as-app/commit/9bb158d3930f96018cb119f298ca40ba52c06b2b))

## 0.2.0 (2025-07-05)


### Features

* Add Release Please and NPM publishing automation ([8be58d2](https://github.com/hiragram/github-as-app/commit/8be58d223eebbe5059d2053184a8d743386cb4c1))


### Miscellaneous Chores

* release 0.2.0 ([10695c9](https://github.com/hiragram/github-as-app/commit/10695c96e383640be0cf24d07fca2d80aa21044c))
