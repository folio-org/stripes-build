# Stripes CLI Commands

Version 2.5.0

This following command documentation is generated from the CLI's own built-in help.  Run any command with the `--help` option to view the latest help for your currently installed CLI.  To regenerate this file, run `yarn docs`.

> Note: Commands labeled "(work in progress)" are incomplete or experimental and subject to change.

* [Common options](#common-options)
* [`alias` command](#alias-command)
* [`build` command](#build-command)
* [`mod` command](#mod-command)
    * [`mod descriptor` command](#mod-descriptor-command)
* [`status` command](#status-command)
* [`completion` command](#completion-command)


## Common options

The following options are available for all commands:

Option | Description | Type | Notes
---|---|---|---
`--help` | Show help | boolean |
`--version` | Show version number | boolean |
`--interactive` | Enable interactive input (use --no-interactive to disable) | boolean | default: true

Examples:

Show help for the build command:
```
$ stripes build --help
```

Disable interactive option
```
$ stripes app create "Hello World" --no-interactive
```


## `alias` command

Maintain global aliases that apply to all platforms and apps [deprecated: use workspace instead]

Usage:
```
$ stripes alias <sub> [mod] [path]
```

Positional | Description | Type | Notes
---|---|---|---
`mod` | UI module to alias | string |
`path` | Relative path to UI module | string |
`sub` | Alias operation | string | required; choices: "add", "list", "remove", "clear"

Examples:

Create alias for ui-users:
```
$ stripes alias add @folio/ui-users ./path/to/ui-users
```
Remove alias for ui-users:
```
$ stripes alias remove @folio/ui-users
```


## `build` command

Build a Stripes tenant bundle

Usage:
```
$ stripes build [configFile] [outputPath]
```

Positional | Description | Type | Notes
---|---|---|---
`configFile` | File containing a Stripes tenant configuration | string |
`outputPath` | Directory to place build output | string |

Option | Description | Type | Notes
---|---|---|---
`--analyze` | Run the Webpack Bundle Analyzer after build (launches in browser) | boolean |
`--createDll` | List of dependencies (comma-separated) to build into a Webpack DLL. | string |
`--devtool` | Specify the Webpack devtool for generating source maps | string |
`--dllName` | Name of Webpack DLL to create. | string |
`--hasAllPerms` | Set "hasAllPerms" in Stripes config | boolean |
`--languages` | Languages to include in tenant build | array |
`--lint` | Show eslint warnings with build | boolean |
`--maxChunks` | Limit the number of Webpack chunks in build output | number |
`--minify` | Minify the bundle output | boolean | default: true
`--okapi` | Specify an Okapi URL | string |
`--output` | Directory to place build output. If omitted, default value of "./output" is used. | string |
`--publicPath` | Specify the Webpack publicPath output option | string |
`--skipStripesBuild` | Bypass Stripes-specific steps in build (useful when building third-party Webpack DLLs). | boolean | default: false
`--sourcemap` | Include sourcemaps in build output | boolean |
`--stripesConfig` | Stripes config JSON  | string | supports stdin
`--tenant` | Specify a tenant ID | string |
`--useDll` | List of DLL manifest files (comma-separated) to include in build. | string |

Examples:

Build a platform (from platform directory):
```
$ stripes build stripes.config.js ./output-dir
```
Build a platform without minification of the bundle:
```
$ stripes build stripes.config.js ./output-dir --no-minify
```
Build a single ui-module (from ui-module directory):
```
$ stripes build --output ./output-dir
```
Builds a Webpack DLL called vendor with react and react-dom:
```
$ stripes build --createDll react,react-dom --dllName vendor --skipStripesBuild
```
Build using vendor and stripes DLLs:
```
$ stripes build stripes.config.js --useDll ./path/vendor.json,./path/stripes.json
```


## `mod` command

Commands to manage UI module descriptors

Usage:
```
$ stripes mod <command>
```

Sub-commands:
* [`stripes mod descriptor`](#mod-descriptor-command)

### `mod descriptor` command

Generate module descriptors for an app or platform.

Usage:
```
$ stripes mod descriptor [configFile]
```

Positional | Description | Type | Notes
---|---|---|---
`configFile` | File containing a Stripes tenant configuration | string |

Option | Description | Type | Notes
---|---|---|---
`--full` | Return full module descriptor JSON | boolean | default: false
`--output` | Directory to write descriptors to as JSON files | string |
`--strict` | Include required interface dependencies | boolean | default: false
`--stripesConfig` | Stripes config JSON  | string | supports stdin

Examples:

Display module descriptor id for current app:
```
$ stripes mod descriptor
```
Display module descriptor ids for platform:
```
$ stripes mod descriptor stripes.config.js
```
Display full module descriptor as JSON:
```
$ stripes mod descriptor --full
```

## `status` command

Display Stripes CLI status information

Usage:
```
$ stripes status [configFile]
```

Positional | Description | Type | Notes
---|---|---|---
`configFile` | File containing a Stripes tenant configuration | string |

Option | Description | Type | Notes
---|---|---|---
`--hasAllPerms` | Set "hasAllPerms" in Stripes config | boolean |
`--languages` | Languages to include in tenant build | array |
`--okapi` | Specify an Okapi URL | string |
`--platform` | View development platform status | boolean |
`--stripesConfig` | Stripes config JSON  | string | supports stdin
`--tenant` | Specify a tenant ID | string |

## `completion` command

Generate a bash completion script.  Follow instructions included with the script for adding it to your bash profile.

Usage:
```
$ stripes completion
```
