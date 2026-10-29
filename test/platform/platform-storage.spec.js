import chaiMod from 'chai';
import PlatformStorage from '../../lib/platform/platform-storage.js';

const expect = chaiMod.expect;

// In-memory stand-in for Configstore so tests never touch the real config file
function fakeConfig() {
  const data = new Map();
  return {
    path: '/fake/config.json',
    has: k => data.has(k),
    set: (k, v) => data.set(k, v),
    get: k => data.get(k),
    delete: k => data.delete(k),
  };
}

describe('The platform-storage module', function () {
  beforeEach(function () {
    this.sut = Object.create(PlatformStorage.prototype);
    this.sut.platformKey = 'test';
    this.sut.config = fakeConfig();
  });

  it('builds alias keys with and without a module name', function () {
    expect(this.sut.aliasKey('@folio/users')).to.equal('platforms.test.aliases.@folio/users');
    expect(this.sut.aliasKey()).to.equal('platforms.test.aliases');
  });

  it('adds and detects aliases', function () {
    expect(this.sut.hasAlias('@folio/users')).to.equal(false);
    expect(this.sut.addAlias('@folio/users', '/abs/path')).to.equal(true);
    expect(this.sut.hasAlias('@folio/users')).to.equal(true);
  });

  it('removes an existing alias and ignores a missing one', function () {
    this.sut.addAlias('@folio/users', '/abs/path');
    this.sut.removeAlias('@folio/users');
    expect(this.sut.hasAlias('@folio/users')).to.equal(false);
    expect(() => this.sut.removeAlias('@folio/users')).not.to.throw();
  });

  it('clears and returns all aliases', function () {
    this.sut.addAlias('@folio/users', '/abs/path');
    this.sut.clearAliases();
    expect(this.sut.getAllAliases()).to.deep.equal({});
  });

  it('reports the storage path', function () {
    expect(this.sut.getStoragePath()).to.equal('/fake/config.json');
  });
});
