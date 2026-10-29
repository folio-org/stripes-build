import chaiMod from 'chai';
import webpack from 'webpack';
import webpackCommon from '../lib/webpack-common.js';

const expect = chaiMod.expect;

describe('The webpack-common module', function () {
  beforeEach(function () {
    this.sut = webpackCommon;
  });

  describe('cliResolve function', function () {
    beforeEach(function () {
      this.inputConfig = {
        entry: [
          '/original/path/to/@folio/stripes-core/src/index',
        ],
        resolve: {
          modules: [],
        },
        resolveLoader: {
          modules: [],
        },
      };
      this.context = {
        isGlobalInstall: false,
        globalPackagesDir: 'path/to/global/npm_modules',
      };
    });

    it('returns a function', function () {
      const webpackOverride = this.sut.cliResolve();
      expect(webpackOverride).to.be.a('function');
    });

    it('updates resolve modules for global installs', function () {
      this.context.isGlobalInstall = true;
      const webpackOverride = this.sut.cliResolve(this.context);
      const result = webpackOverride(this.inputConfig);

      expect(result.resolve.modules).to.include('path/to/global/npm_modules');
      expect(result.resolveLoader.modules).to.include('path/to/global/npm_modules');
    });

    it('does not update resolve modules for other installs', function () {
      const webpackOverride = this.sut.cliResolve(this.context);
      const result = webpackOverride(this.inputConfig);

      expect(result.resolve.modules).to.not.include('path/to/global/npm_modules');
      expect(result.resolveLoader.modules).to.not.include('path/to/global/npm_modules');
    });
  });

  describe('ignoreCache', () => {
    it('"--cache false" turns off caching', () => {
      expect(webpackCommon.ignoreCache({})).to.eql({ cache: false });
    });
  });

  describe('cliResolve function with a global install', function () {
    it('adds the global packages dir to resolve modules', function () {
      const config = { entry: [], resolve: { modules: [] }, resolveLoader: { modules: [] } };
      const out = this.sut.cliResolve({ isGlobalInstall: true, globalPackagesDir: '/global' })(config);
      expect(out.resolve.modules).to.deep.equal(['/global']);
      expect(out.resolveLoader.modules).to.deep.equal(['/global']);
    });
  });

  describe('cliAliases function', function () {
    it('adds aliases to resolve.alias', function () {
      const out = this.sut.cliAliases({ '@folio/users': '/u' })({ resolve: { alias: {} } });
      expect(out.resolve.alias).to.deep.equal({ '@folio/users': '/u' });
    });

    it('leaves config alone without aliases', function () {
      const config = { resolve: { alias: {} } };
      expect(this.sut.cliAliases()(config).resolve.alias).to.deep.equal({});
    });
  });

  describe('emitLintWarnings function', function () {
    it('adds an eslint-loader rule', function () {
      const out = this.sut.emitLintWarnings({ module: { rules: [] } });
      expect(out.module.rules).to.have.length(1);
      expect(out.module.rules[0].loader).to.equal('eslint-loader');
    });
  });

  describe('limitChunks function', function () {
    it('adds a LimitChunkCountPlugin', function () {
      const out = this.sut.limitChunks(2)({ plugins: [] });
      expect(out.plugins[0]).to.be.an.instanceof(webpack.optimize.LimitChunkCountPlugin);
    });
  });

  describe('output processing', function () {
    beforeEach(function () {
      this.exit = this.sandbox.stub(process, 'exit');
      this.error = this.sandbox.stub(console, 'error');
      this.log = this.sandbox.stub(console, 'log');
    });

    it('processError logs the error and exits', function () {
      this.sut.processError('boom');
      expect(this.error).to.have.been.calledWith('boom');
      expect(this.exit).to.have.been.calledWith(1);
    });

    it('processError exits without logging when there is no error', function () {
      this.sut.processError();
      expect(this.error).not.to.have.been.called;
      expect(this.exit).to.have.been.calledWith(1);
    });

    it('processStats prints stats and does not exit on success', function () {
      this.sut.processStats({ toString: () => 'ok', hasErrors: () => false });
      expect(this.log).to.have.been.calledWith('ok');
      expect(this.exit).not.to.have.been.called;
    });

    it('processStats exits when stats have errors', function () {
      this.sut.processStats({ toString: () => 'bad', hasErrors: () => true });
      expect(this.exit).to.have.been.calledWith(1);
    });
  });
});
