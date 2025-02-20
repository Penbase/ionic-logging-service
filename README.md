# ionic-logging-service workspace

[![Build](https://markus.visualstudio.com/ionic-logging/_apis/build/status/ionic-logging-service?branchName=master)](https://markus.visualstudio.com/ionic-logging/_build/latest?definitionId=24&branchName=master)
[![Codecov](https://codecov.io/gh/Ritzlgrmft/ionic-logging-service/branch/master/graph/badge.svg)](https://codecov.io/gh/Ritzlgrmft/ionic-logging-service)
[![Version](https://badge.fury.io/js/ionic-logging-service.svg)](https://www.npmjs.com/package/ionic-logging-service)
[![Downloads](https://img.shields.io/npm/dt/ionic-logging-service.svg)](https://www.npmjs.com/package/ionic-logging-service)
[![Dependencies](https://david-dm.org/ritzlgrmft/ionic-logging-service/master/status.svg)](https://david-dm.org/ritzlgrmft/ionic-logging-service/master)
[![Peer-Dependencies](https://david-dm.org/ritzlgrmft/ionic-logging-service/master/peer-status.svg)](https://david-dm.org/ritzlgrmft/ionic-logging-service/master?type=peer)
[![Dev-Dependencies](https://david-dm.org/ritzlgrmft/ionic-logging-service/master/dev-status.svg)](https://david-dm.org/ritzlgrmft/ionic-logging-service/master?type=dev)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/ritzlgrmft/ionic-logging-service/badge.svg)](https://snyk.io/test/github/ritzlgrmft/ionic-logging-service)
[![License](https://img.shields.io/npm/l/ionic-logging-service.svg)](https://www.npmjs.com/package/ionic-logging-service)

The ionic-logging-service encapsulates [log4javascript](http://log4javascript.org/)'s functionalities for apps built with [Ionic framework](http://ionicframework.com).

The workspace contains these projects:

## ionic-logging-service

The main service. For further info have a look at the [service's readme](https://github.com/Ritzlgrmft/ionic-logging-service/blob/master/projects/ionic-logging-service/README.md).

Useful commands:

* `npm run build-service`
* `npm run test-service`
* `npm run compodoc-service`

## ionic-logging-viewer

The viewer component. For further info have a look at the [component's readme](https://github.com/Ritzlgrmft/ionic-logging-service/blob/master/projects/ionic-logging-viewer/README.md).

Useful commands:

* `npm run build-viewer`
* `npm run test-viewer`
* `npm run compodoc-viewer`

## ionic-logging-viewer-app

A test app for the `ionic-logging-viewer` as well as a sample app for `ionic-logging-service`.

Useful commands:

* `ionic serve --project ionic-logging-viewer-app`

## ionic-logging-viewer-app-e2e

E2E tests for `ionic-logging-viewer-app`.

Useful commands:

* `ng e2e --project ionic-logging-viewer-app-e2e`

## Upgrade library

To upgrade the library and then make new Angular version compatible, follow previous pull requests.

Upgrade versions in `package.json` files at root level and in `projects/ionic-logging-service/package.json`.

Then run `rm -rf node_modules package-lock.json && npm install` at root level. Do not run `npm install` in `projects/ionic-logging-service` directory, otherwise is will cause loop issues during testing.

Also for each upgrade make sure tests are passing, run `npm run test-ci`.
