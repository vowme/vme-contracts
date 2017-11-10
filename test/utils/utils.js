// taken/borrowed from ROSCA/WeTrust https://github.com/WeTrustPlatform/rosca-contracts/blob/b72ee795d2a73b5fda76b7015720b6ea5f8c8804/test/utils/utils.js
// thanks!

module.exports = {
  crowdsaleState: {
    PREFUNDING: 0,
    FUNDING: 1,
    SUCCESS: 2,
    FAILURE: 3
  },
  numBlocksLocked: 12,
  gasEpsilon: 5000,
  assertThrows: function(promise, err) {
    return promise.then(function() {
      assert.isNotOk(true, err);
    }).catch(function(e) {
      assert.include(e.message, 'invalid opcode');
    });
  },
  getFunctionSelector: function(functionSignature) {
    // no spaces
    functionSignature = functionSignature.replace(/ /g, '');
    // no uints, only uint256s
    functionSignature = functionSignature.replace(/uint,/g, 'uint256,');
    functionSignature = functionSignature.replace(/uint\)/g, 'uint256)');
    return web3.sha3(functionSignature).slice(0, 10);
  },
  // TODO: make this more robust, can args be a single entity, not an array, replace spaces in signature,...
  getFunctionEncoding: function(functionSignature, args) {
    selector = this.getFunctionSelector(functionSignature);
    argString = '';
    for (let i = 0; i < args.length; i++) {
      paddedArg = web3.toHex(args[i]).slice(2);
      while (paddedArg.length % 64 != 0) {
        paddedArg = '0' + paddedArg;
      }
      argString = argString + paddedArg;
    }
    return selector + argString;
  },
  increaseTime: function(bySeconds) {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [bySeconds],
      id: new Date().getTime(),
    });
  },
  mineOneBlock: function() {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      id: new Date().getTime(),
    });
  },
  mineToBlockHeight: function(targetBlockHeight) {
    while (web3.eth.blockNumber < targetBlockHeight) {
      this.mineOneBlock();
    }
  },
};