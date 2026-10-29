import chaiMod from 'chai';
import stdin from '../../lib/cli/stdin.js';

const expect = chaiMod.expect;

describe('The stdin wrapper', function () {
  afterEach(function () {
    delete process.stdout.isTTY;
  });

  it('resolves with no value when stdout is not a TTY', async function () {
    process.stdout.isTTY = false;
    expect(await stdin.getStdin()).to.equal(undefined);
  });

  it('delegates to get-stdin when stdout is a TTY', async function () {
    process.stdout.isTTY = true;
    // get-stdin resolves immediately when stdin itself is a TTY
    process.stdin.isTTY = true;
    try {
      expect(await stdin.getStdin()).to.equal('');
    } finally {
      delete process.stdin.isTTY;
    }
  });
});
