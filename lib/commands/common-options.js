const okapiOptions = {
  okapi: {
    type: 'string',
    describe: 'Specify an Okapi URL',
    group: 'Okapi Options:',
  },
  tenant: {
    type: 'string',
    describe: 'Specify a tenant ID',
    group: 'Okapi Options:',
  },
};

// When applied as a positional, "configFile" is the first parameter:
//    yargs.positional('configFile', stripesConfigFile.configFile)
const stripesConfigFile = {
  configFile: {
    type: 'string',
    describe: 'File containing a Stripes tenant configuration',
    applyAsPositional: true,
    conflicts: 'stripesConfig'
  },
};

const stripesConfigStdin = {
  stripesConfig: {
    type: 'string',
    describe: 'Stripes config JSON (stdin)',
    conflicts: 'configFile',
  },
};

const stripesConfigOptions = {
  hasAllPerms: {
    type: 'boolean',
    describe: 'Set "hasAllPerms" in Stripes config',
  },
  languages: {
    type: 'array',
    describe: 'Languages to include in tenant build',
  }
};

const buildOptions = {
  // prod: {
  //   type: 'boolean',
  //   describe: 'Use production build settings',
  //   conflicts: 'dev',
  //   default: undefined,
  // },
  // dev: {
  //   type: 'boolean',
  //   describe: 'Use development build settings',
  //   conflicts: 'prod',
  //   default: undefined,
  // },
  publicPath: {
    describe: 'Specify the Webpack publicPath output option',
    type: 'string',
  },
  devtool: {
    type: 'string',
    describe: 'Specify the Webpack devtool for generating source maps',
  },
  lint: {
    type: 'boolean',
    describe: 'Show eslint warnings with build',
  },
  maxChunks: {
    type: 'number',
    describe: 'Limit the number of Webpack chunks in build output',
  },
  cache: {
    type: 'boolean',
    describe: 'Use webpack cache',
    default: true,
  },
};

export default {
  okapiOptions,
  stripesConfigFile,
  stripesConfigStdin,
  stripesConfigOptions,
  buildOptions,
};
