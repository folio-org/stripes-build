import * as chaiMod from 'chai';
import buildAppCommand from '../../lib/commands/build.js';
import webpackCommonMod from '../../lib/webpack-common.js';

const expect = chaiMod.expect;

const { ignoreCache } = webpackCommonMod;

const packageJsonStub = {};
const tenantConfig = {};

function StripesModuleParserStub(name) {
  this.packageJson = Object.assign({}, packageJsonStub, { name }); // eslint-disable-line react/no-this-in-sfc
}

const stripesCoreStub = {
  api: {
    build: () => Promise.resolve({ hasErrors: () => {} }),
    StripesModuleParser: StripesModuleParserStub,
  }
};

const platformStub = {
  getWebpackOverrides: () => [],
  getStripesConfig: () => tenantConfig,
  getStripesCore: () => stripesCoreStub,
};

describe('The app create command', function () {
  beforeEach(function () {
    this.argv = {
      context: 'hello world',
      desc: 'my first app',
    };
    this.argv.context = {
      type: 'empty',
      cwd: '/path/to/working/directory',
      cliRoot: '/path/to/cliRoot',
      isEmpty: true,
    };

    this.sut = buildAppCommand;
    this.sandbox.spy(console, 'log');
    this.sandbox.spy(buildAppCommand, 'handler');
    this.sandbox.spy(stripesCoreStub.api, 'build');
  });

  it('calls "build app" handler with default output folder when --output flag is omitted.', function (done) {
    const expectedArgs = Object.assign({}, this.argv, { outputPath: './output', webpackOverrides: [] });
    this.sut.stripesOverrides(platformStub, stripesCoreStub);
    this.sut.handler(this.argv);

    expect(buildAppCommand.handler).to.have.been.calledOnce;
    expect(stripesCoreStub.api.build).to.have.been.calledWith(tenantConfig, expectedArgs);
    expect(console.log).to.have.been.calledWithMatch('Building...');
    done();
  });

  it('calls "build app" handler with specified output folder when --output flag is used.', function (done) {
    const expectedArgs = Object.assign({}, this.argv, { outputPath: './custom-path', output: './custom-path', webpackOverrides: [] });
    this.sut.stripesOverrides(platformStub, stripesCoreStub);
    this.sut.handler(Object.assign({}, this.argv, { output: './custom-path' }));

    expect(buildAppCommand.handler).to.have.been.calledOnce;
    expect(stripesCoreStub.api.build).to.have.been.calledWith(tenantConfig, expectedArgs);
    expect(console.log).to.have.been.calledWithMatch('Building...');
    done();
  });

  it('turns off webpack caching when --output flag is used.', function () {
    const expectedArgs = Object.assign({}, this.argv, { cache: false, outputPath: './output', webpackOverrides: [ignoreCache] });
    this.sut.stripesOverrides(platformStub, stripesCoreStub);
    this.sut.handler(Object.assign({}, this.argv, { cache: false }));

    expect(buildAppCommand.handler).to.have.been.calledOnce;
    expect(stripesCoreStub.api.build).to.have.been.calledWith(tenantConfig, expectedArgs);
  });

  describe('handler options', function () {
    beforeEach(function () {
      this.warn = this.sandbox.stub(console, 'warn');
      this.sut.stripesOverrides(platformStub, stripesCoreStub);
      this.sandbox.stub(process, 'exit');
      this.sandbox.stub(platformStub, 'getWebpackOverrides').returns([]);
      this.overrides = () => stripesCoreStub.api.build.lastCall.args[1].webpackOverrides;
    });

    afterEach(function () {
      delete process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
    });

    it('defaults NODE_ENV to production', function () {
      delete process.env.NODE_ENV;
      this.sut.handler(this.argv);
      expect(process.env.NODE_ENV).to.equal('production');
    });

    it('does not build in dev mode', function () {
      this.sut.handler({ ...this.argv, dev: true });
      expect(stripesCoreStub.api.build).not.to.have.been.called;
    });

    it('warns when building a platform without a stripes config', function () {
      this.argv.context.isPlatform = true;
      this.sut.handler(this.argv);
      expect(this.warn).to.have.been.calledWithMatch('Building a platform without a stripes configuration');
    });

    it('does not warn when federating', function () {
      this.argv.context.isPlatform = true;
      this.sut.handler({ ...this.argv, federate: true });
      expect(this.warn).not.to.have.been.called;
    });

    it('adds the bundle analyzer override', async function () {
      await this.sut.handler({ ...this.argv, analyze: true });
      expect(this.overrides()).to.have.length(1);
      const config = this.overrides()[0]({ plugins: [] });
      expect(config.plugins).to.have.length(1);
    });

    it('adds the lint override', function () {
      this.sut.handler({ ...this.argv, lint: true });
      expect(this.overrides()).to.have.length(1);
    });

    it('adds the chunk limit override', function () {
      this.sut.handler({ ...this.argv, maxChunks: 3 });
      expect(this.overrides()).to.have.length(1);
    });

    it('adds the plugin beforeBuild override', function () {
      const hook = () => {};
      const beforeBuild = this.sandbox.stub().returns(hook);
      this.argv.context.plugin = { beforeBuild };
      this.sut.handler(this.argv);
      expect(beforeBuild).to.have.been.calledOnce;
      expect(this.overrides()).to.deep.equal([hook]);
    });

    it('skips the stripes config when skipStripesBuild is set', function () {
      this.sut.handler({ ...this.argv, skipStripesBuild: true });
      expect(stripesCoreStub.api.build.lastCall.args[0]).to.equal(null);
    });
  });

  describe('builder', function () {
    it('configures yargs with options and examples', function () {
      const yargs = {};
      for (const m of ['middleware', 'positional', 'option', 'options', 'example']) {
        yargs[m] = this.sandbox.stub().returns(yargs);
      }
      this.sut.builder(yargs);
      expect(yargs.middleware).to.have.been.calledOnce;
      expect(yargs.option.callCount).to.be.greaterThan(5);
      expect(yargs.example).to.have.callCount(5);
    });
  });
});
