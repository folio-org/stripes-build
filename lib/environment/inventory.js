import fs from 'fs-extra';
import path from 'node:path';

const MODULE_CACHE_FILE = '/inventory.json';

// Modules not present in a stripes.config, but do need to be included when
// generating module descriptors for a platform
const moduleDescriptorExtras = [
  'stripes-smart-components',
  'stripes-core',
];

function readModules() {
  return fs.readJSONSync(path.join(import.meta.dirname, MODULE_CACHE_FILE));
}

const allModules = () => {
  return readModules();
};

function stripesModules() {
  const mods = readModules();
  return mods.libs;
}

// Add the @folio scope, omitting "ui-" prefix if necessary
function toFolioName(theModule) {
  const mods = allModules();
  let moduleName = theModule;
  if (mods.apps.includes(theModule)) {
    moduleName = moduleName.replace(/^ui-/, '');
  }
  return `@folio/${moduleName}`;
}

// Mapping of extra modules based on existence of other modules.
const backendDescriptorExtras = [
  { match: ['folio_search', 'folio_inventory'],
    ids: ['mod-codex-inventory'] },
  { match: ['folio_search', 'folio_eholdings'],
    ids: ['mod-codex-ekb'] }
];

export default {
  stripesModules,
  toFolioName,
  moduleDescriptorExtras,
  backendDescriptorExtras,
};
