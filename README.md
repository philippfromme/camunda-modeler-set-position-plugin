# Camunda Modeler Set Position Plugin

[![Compatible with Camunda Modeler version 2.2](https://img.shields.io/badge/Camunda%20Modeler-2.2+-blue.svg)](https://github.com/camunda/camunda-modeler)

![Screenshot](./docs/screenshot.png)

This [Camunda Modeler Plugin](https://github.com/camunda/camunda-modeler) lets you set an element's position through the properties panel.

> :warning: This plugin disables the [align-to-origin feature](https://github.com/bpmn-io/align-to-origin) since it would change element positions whenever you save.

## Using the Plugin

1. [Download ZIP](https://github.com/philippfromme/camunda-modeler-set-position-plugin/archive/master.zip)
2. Extract
3. Move to [app data directory](https://github.com/camunda/camunda-modeler/tree/master/docs/search-paths#app-data-directory) or [user data directory](https://github.com/camunda/camunda-modeler/tree/master/docs/search-paths#user-data-directory) (make sure to move the plugin, not its parent directory)
4. Restart Camunda Modeler

## Building the Plugin

Install dependencies:

```sh
npm install
```

Package plugin to `client/client-bundle.js`:

```sh
npm run bundle
```

or

```sh
npm run bundle:watch
```

## Additional Resources

* [Plugins documentation](https://github.com/camunda/camunda-modeler/tree/master/docs/plugins)

# Licence

MIT
