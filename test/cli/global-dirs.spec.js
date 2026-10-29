import chaiMod from 'chai';
import childProcess from 'node:child_process';
import path from 'node:path';

const expect = chaiMod.expect;

// global-dirs runs its Windows fix-up at import time, so each case re-imports a fresh copy
let counter = 0;
const freshImport = () => import(`../../lib/cli/global-dirs.js?case=${counter++}`);

describe('The global-dirs module', function () {
  beforeEach(function () {
    this.platform = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterEach(function () {
    Object.defineProperty(process, 'platform', this.platform);
  });

  const setPlatform = (value) => Object.defineProperty(process, 'platform', { value });

  it('leaves paths alone on non-Windows platforms', async function () {
    setPlatform('linux');
    const exec = this.sandbox.stub(childProcess, 'execSync');
    await freshImport();
    expect(exec).not.to.have.been.called;
  });

  it('rewrites yarn paths on Windows with yarn >= 1.5.1', async function () {
    setPlatform('win32');
    this.sandbox.stub(childProcess, 'execSync').returns('1.22.0\n');
    const { default: globalDirs } = await freshImport();
    expect(globalDirs.yarn.packages).to.equal(path.join(globalDirs.yarn.prefix, 'Data', 'global', 'node_modules'));
    expect(globalDirs.yarn.binaries).to.equal(path.join(globalDirs.yarn.packages, '.bin'));
  });

  it('does not rewrite yarn paths on Windows with an older yarn', async function () {
    setPlatform('win32');
    this.sandbox.stub(childProcess, 'execSync').returns('1.0.0');
    const { default: globalDirs } = await freshImport();
    const before = globalDirs.yarn.packages;
    expect(before).to.be.a('string');
    expect(globalDirs.yarn.packages).to.equal(before);
  });

  it('logs and continues when yarn version cannot be determined', async function () {
    setPlatform('win32');
    this.sandbox.stub(childProcess, 'execSync').throws(new Error('no yarn'));
    const errorStub = this.sandbox.stub(console, 'error');
    await freshImport();
    expect(errorStub).to.have.been.calledWithMatch('Unable to determine Yarn version.');
  });
});
