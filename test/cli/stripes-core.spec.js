import chaiMod from 'chai';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import StripesCore from '../../lib/cli/stripes-core.js';

const expect = chaiMod.expect;

describe('The StripesCore class', function () {
  beforeEach(function () {
    this.tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'stripes-core-')));
    this.context = { cwd: this.tmp, cliRoot: this.tmp };
  });

  afterEach(function () {
    fs.rmSync(this.tmp, { recursive: true, force: true });
  });

  it('prefers the stripes-webpack alias', function () {
    const sut = new StripesCore(this.context, { '@folio/stripes-webpack': '/alias/path' });
    expect(sut.corePath).to.equal('/alias/path');
  });

  it('throws when stripes-webpack cannot be located', function () {
    expect(() => new StripesCore(this.context, {})).to.throw('Unable to locate stripes-webpack path.');
  });

  it('also searches the global packages dir for a global install', function () {
    const globalDir = path.join(this.tmp, 'global');
    fs.mkdirSync(path.join(globalDir, 'node_modules', '@folio', 'stripes-webpack'), { recursive: true });
    fs.writeFileSync(path.join(globalDir, 'node_modules', '@folio', 'stripes-webpack', 'package.json'), '{"name":"@folio/stripes-webpack"}');
    const context = { ...this.context, isGlobalInstall: true, globalPackagesDir: globalDir };
    const sut = new StripesCore(context, {});
    expect(sut.corePath).to.include('stripes-webpack');
  });

  describe('module loading', function () {
    beforeEach(function () {
      this.sut = new StripesCore(this.context, { '@folio/stripes-webpack': this.tmp });
    });

    it('joins module ids onto a core path outside node_modules', function () {
      expect(this.sut.getCoreModulePath('webpack/x')).to.equal(path.join(this.tmp, 'webpack/x'));
    });

    it('resolves module ids via node resolution within node_modules', function () {
      const pkg = path.join(this.tmp, 'node_modules', '@folio', 'stripes-webpack');
      fs.mkdirSync(path.join(pkg, 'webpack'), { recursive: true });
      fs.writeFileSync(path.join(pkg, 'package.json'), '{"name":"@folio/stripes-webpack"}');
      fs.writeFileSync(path.join(pkg, 'webpack', 'x.js'), 'module.exports = {};');
      const sut = new StripesCore(this.context, { '@folio/stripes-webpack': pkg });
      expect(sut.getCoreModulePath('webpack/x')).to.equal(path.join(pkg, 'webpack', 'x.js'));
    });

    it('builds and caches the augmented node api', function () {
      this.sandbox.stub(this.sut, 'getCoreModule').callsFake((id) => {
        if (id === 'webpack/stripes-module-parser') return { StripesModuleParser: 'parser' };
        if (id === 'webpack/stripes-build-error') return 'buildError';
        return {};
      });
      const api = this.sut.api;
      expect(api.StripesModuleParser).to.equal('parser');
      expect(api.StripesBuildError).to.equal('buildError');
      expect(this.sut.api).to.equal(api);
      expect(this.sut.getCoreModule.callCount).to.equal(3);
    });

    it('loads a CommonJS module', function () {
      fs.writeFileSync(path.join(this.tmp, 'mod.cjs'), 'module.exports = { ok: true };');
      expect(this.sut.getCoreModule('mod.cjs')).to.deep.equal({ ok: true });
    });
  });
});
