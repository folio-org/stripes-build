# stripes-build User Guide

stripes-build is a CLI for building Stripes UI platforms. It is nothing more than a stripped down copy of [stripes-cli](https://github.com/folio-org/stripes-cli) with fewer commands and fewer dependencies, i.e. optimized for generating builds in a production environment.

* [Installation](#installation)
* [Options](#options)
* [Help](#help)
* [Sub-commands](#sub-commands)
* [Configuration](#configuration)
    * [Module export](#module-export)
    * [Environment variables](#environment-variables)
* [Stripes configuration](#stripes-configuration)
* [Generating a production build](#generating-a-production-build)
    * [Analyzing bundle output](#analyzing-bundle-output)
    * [Reducing build output](#reducing-build-output)
    * [Using Webpack DLL](#using-webpack-dll)
* [Viewing diagnostic output](#viewing-diagnostic-output)

## Installation

Add `@folio/stripes-build` as a direct-dependency of a platform. Refer to [configuring the FOLIO registry](https://github.com/folio-org/stripes/blob/master/doc/new-development-setup.md#configure-the-folio-registry) for information on how to configure your NPM registry and which registry to use.

## Options

Any option can be passed to the CLI either on the command line, as an [environment variable](#environment-variables), or in a `.stripesclirc` [configuration file](#configuration).

Options passed on the command line are prefixed with `--` in the form of `--optionName value`.

```
$ stripes-build --output /some/path
```

Notes:
* Boolean options are considered true by simply passing the option name. No value is required.
* To explicitly set a Boolean option to false, prefix the option name with `--no-` as in `--no-optionName`.
* Options that take an array as their argument work by consuming values from the command-line until the next "--" is found.
* String arguments can be wrapped in quotes when spaces are desired. This is helpful for descriptions.

Example passing array values for `languages` and false for `install`:
```
$ stripes-build build stripes.config.js --languages en es --no-install
```

Example when there is a space in the path to the config file:
```
$ stripes-build build "/path to/stripes.config.js"
```

### Help
Every command includes a description, list of options with descriptions, and often example usages. To view help for any command, simply pass the `--help` option to the command.

```
$ stripes-build build --help
```

## Configuration
Frequently used options can be saved to a `.stripesclirc` configuration file to avoid entering them each time. Stripes CLI will use the configuration file found in the current working directory, or the first one found walking up the tree. The default configuration file format is JSON.

Any supported command-line positional or option can be defined. For example:
```json
{
  "configFile": "stripes.config.js",
  "port": 8080
}
```

### Module export
In addition to JSON, the CLI configuration may be authored as a JavaScript module export. This is useful for generating options dynamically or defining [CLI plugins](./dev-guide.md#plugins). When defining a JavaScript module export, be sure to use the `.js` file extension.

Example `.stripesclirc.js`:
```javascript
const environment = process.env.NODE_ENV;
let url;

if (environment === 'sandbox') {
  url = 'https://okapi-sandbox.frontside.io';
} else {
  url = 'https://okapi.frontside.io';
}

module.exports = {
  okapi: url,
  tenant: 'fs',
  install: true,
}
```

### Environment variables
Any CLI option can be set using environment variables prefixed with `STRIPES_`. For example, to specify the `--port` option, use an environment variable named `STRIPES_PORT`.

## Stripes configuration

A Stripes config file is used to describe a tenant's front-end module configuration for a platform. This file is often described in documentation as a JavaScript module export (`stripes.config.js`). However, it should be noted that JSON format is also accepted.

For example, this `stripes.config.js` file:
```javascript
module.exports = {
  okapi: {
    url: 'http://localhost:9130',
    tenant: 'diku',
  },
  config: {
  },
  modules: {
    '@folio/trivial': {},
    '@folio/users': {},
  },
};
```

Could be written as `stripes.config.json` in JSON format:
```json
{
  "okapi": {
    "url": "http://localhost:9130",
    "tenant": "diku"
  },
  "config": {
  },
  "modules": {
    "@folio/trivial": {},
    "@folio/users": {}
  }
}
```

Further, when using JSON format, stripes-build also accepts this configuration piped via stdin. Therefore, given the above configuration files exist, each of these commands would produce the same output:

```
$ stripes-build build stripes.config.js
$ stripes-build build stripes.config.json
$ cat stripes.config.json | stripes-build build
```

The last example becomes useful when your Stripes configuration does not reside on disk and is instead emitted from another process.

## Generating a production build

The following describes how to build `platform-complete`:

```
$ git clone https://github.com/folio-org/platform-complete.git
$ cd platform-complete
$ yarn install
$ stripes-build build stripes.config.js my-build-output
```

If source maps are desired, include them with the `--sourcemap` option.
```
$ stripes-build build stripes.config.js my-build-output --sourcemap
```

> Note: Stripes configuration is also accepted in [JSON format](#stripes-configuration).

The generated build assets will be placed in the directory path provided (in this case, `my-build-output`). These files are ready to serve up from the file server of your choice.

### Analyzing bundle output

To use the Webpack Bundle Analyzer to visualize the contents of the bundle to help identify area for optimization, pass the `--analyze` option to the `build` command:

```
$ stripes-build build stripes.config.js my-build-output --analyze
```

### Reducing build output

One quick way to limit the build output is to limit the number of languages included in the build. This is done by modifying a tenant's Stripes configuration. See [filtering translations at build time](https://github.com/folio-org/stripes/blob/master/doc/dev-guide.md#filtering-translations-at-build-time) of the Stripes developer guide on how to to this. The result will not only limit translation files, but also locale assets for `react-intl` and `moment` libraries.

Filtering languages can be done with the CLI by specifying the `languages` option which accepts an array of values.
```
$ stripes-build build stripes.config.js --languages en es
```

### Using Webpack DLL

A technique you can use to pre-build dependencies that change less frequently so that subsequent builds can be more focused in what code needs to be transpiled and will therefore run more quickly. For more information see: [DllPlugin documentation](https://webpack.js.org/plugins/dll-plugin/).

For example, you could choose to create a re-usable DLL for third-party dependencies and call it "vendor" (note that using the flag `--skipStripesBuild` is appropriate here as it will exclude Stripes-specific steps during the build. It should not be used when building a Stripes DLL):
```
$ stripes-build build --createDll react,react-dom,react-router --dllName vendor --skipStripesBuild
```

To then use that DLL in the final bundle, point to the manifest JSON file:
```
$ stripes-build build --useDll ./path/to/dll/vendor.json
```

The benefit is that if you make changes to your code, you only need to re-run the final bundle command above which bypasses the need to re-bundle the third-party dependencies, which reduces the build time. Note that in this case if you update the version of a third-party dependency, you will then need to run both commands for the change to affect the final bundle.

## Viewing diagnostic output

The `status` command is a helpful starting point for diagnosing errors. Among other things, `status` will output which stripes-core is in use, the stripes config for the current context and list any aliases.

```
$ stripes-build status stripes.config.js
```

To view diagnostic output for any command while it is running, set the `DEBUG` environment variable to `stripes*`. For example:
```
$ export DEBUG=stripes*
$ stripes-build build stripes.config.js
```

On Windows set the environment variable using the `set` command:
```
$ set DEBUG=stripes*
```

See the [debugging section](./dev-guide.md#debugging) in the developer guide for more information on `DEBUG` usage.

