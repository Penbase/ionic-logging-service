# Breaking Changes

## Version 18

- Update to Angular 18
- Add an entry in README.md to explain how to upgrade the library over the time

## Version 17

- Update to Angular 17

## Version 16

- Update to Angular 16
- Upgrading Puppeteer to a non deprecated version. Puppeteer's old version was blocking the tests.

## Version 14

- Update to Angular 14
- Use webpack 5 (TU)
- Migration tslint to eslint

## Version 11

- update to Angular 11

## Version 10

### ionic-logging-service

- logMessagesChanged does no longer emit the last added message

### ionic-logging-viewer

- LoggingViewerModal component provides now by default a delete button for deleting the existing messages.
  The button can be hidden using the `allowClearLogs` parameter.

## Version 9

- update to Angular 9

## Version 8

- update to Angular 8

## Version 7

- update to Angular 7

## Version 6

With version 6, these breaking changes were introduced:

- update to Angular 6 (instead of 5)
- no usage of [ionic-configuration-service](https://github.com/Ritzlgrmft/ionic-configuration-service) any more
- import of `LoggingServiceModule`

### Migration of the configuration

- move logging configuration from `src/assets/settings.json` to `environments/environment.ts`
- import of `LoggingServiceModule`
- load configuration in your `AppModule`
