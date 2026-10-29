import chaiMod from 'chai';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const expect = chaiMod.expect;

// config.js reads the CLI config at import time, so each case re-imports a fresh copy from a temp cwd
let counter = 0;
const freshImport = () => import(`../../lib/cli/config.js?case=${counter++}`);

describe('The CLI config module', function () {
  beforeEach(function () {
    this.origCwd = process.cwd();
    this.tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'stripes-config-')));
    process.chdir(this.tmp);
  });

  afterEach(function () {
    process.chdir(this.origCwd);
    fs.rmSync(this.tmp, { recursive: true, force: true });
  });

  it('uses empty defaults when no config file is found', async function () {
    const { default: config } = await freshImport();
    expect(config.configPath).to.equal(null);
    expect(config.plugins).to.equal(undefined);
    expect(config.commandDirOptions).to.deep.equal({});
  });

  it('loads a JSON config and strips plugins from the yargs config', async function () {
    fs.writeFileSync('.stripesclirc', JSON.stringify({ okapi: 'http://x', aliases: { a: '/a' } }));
    const { default: config } = await freshImport();
    expect(config.configPath).to.equal(path.join(this.tmp, '.stripesclirc'));
    expect(config.yargsConfig).to.deep.equal({ okapi: 'http://x', aliases: { a: '/a' } });
    expect(config.aliases).to.deep.equal({ a: '/a' });
  });

  it('loads a JS config', async function () {
    fs.writeFileSync('.stripesclirc.js', 'export default { okapi: "http://js" };');
    const { default: config } = await freshImport();
    expect(config.yargsConfig.okapi).to.equal('http://js');
  });

  describe('plugins', function () {
    beforeEach(function () {
      this.beforeBuild = () => 'hook';
      this.configWith = async (plugins) => {
        fs.writeFileSync('.stripesclirc.js', `export default { plugins: ${plugins} };`);
        return (await freshImport()).default;
      };
    });

    it('provides a visitor and removes plugins from the yargs config', async function () {
      const config = await this.configWith('{ build: { options: { foo: {} } } }');
      expect(config.commandDirOptions.visit).to.be.a('function');
      expect(config.yargsConfig).not.to.have.property('plugins');
    });

    it('returns the command untouched when no plugin matches', async function () {
      const config = await this.configWith('{ build: {} }');
      const command = { builder: () => {}, handler: () => {} };
      expect(config.commandDirOptions.visit(command, '/p/other.js', 'other.js')).to.equal(command);
      expect(command.builder).to.be.a('function');
    });

    it('injects plugin options into the command builder', async function () {
      const config = await this.configWith('{ build: { options: { foo: { type: "string" } } } }');
      const originalBuilder = this.sandbox.stub().returns('built');
      const command = { builder: originalBuilder, handler: () => {} };
      config.commandDirOptions.visit(command, '/p/build.js', 'build.js');
      const yargs = { options: this.sandbox.stub() };
      expect(command.builder(yargs)).to.equal('built');
      expect(yargs.options).to.have.been.calledWith({ foo: { type: 'string' } });
      expect(originalBuilder).to.have.been.calledWith(yargs);
    });

    it('injects the beforeBuild hook into the command handler', async function () {
      const config = await this.configWith('{ build: { beforeBuild: () => "hook" } }');
      const originalHandler = this.sandbox.stub();
      const command = { builder: () => {}, handler: originalHandler };
      config.commandDirOptions.visit(command, '/p/build.js', 'build.js');
      command.handler({ a: 1 });
      expect(originalHandler.firstCall.args[0]).to.deep.equal({ a: 1 });
      expect(originalHandler.firstCall.args[1].plugin.beforeBuild()).to.equal('hook');
    });

    it('maps the legacy karma command to the test plugin', async function () {
      const config = await this.configWith('{ test: { options: { foo: {} } } }');
      const command = { builder: () => {}, handler: () => {} };
      const original = command.builder;
      config.commandDirOptions.visit(command, '/p/karma.js', 'karma.js');
      expect(command.builder).not.to.equal(original);
    });
  });
});
