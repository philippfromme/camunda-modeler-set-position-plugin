# Camunda Modeler Set Position Plugin

[![Compatible with Camunda Modeler version 2.2](https://img.shields.io/badge/Camunda%20Modeler-2.2+-blue.svg)](https://github.com/camunda/camunda-modeler)

![Screenshot](./docs/screenshot.png)

This [Camunda Modeler Plugin](https://github.com/camunda/camunda-modeler) lets you set an element's position through the properties panel.

> :warning: This plugin disables the [align-to-origin feature](https://github.com/bpmn-io/align-to-origin) since it would change element positions whenever you save.

## Building

Install dependencies:

```sh
npm install
```

Package plugin to `client/client-bundle.js`:

```sh
npm run bundle

# or

npm run bundle:watch
```

## Additional Resources

* [Plugins documentation](https://github.com/camunda/camunda-modeler/tree/master/docs/plugins)

## Licence

MIT
