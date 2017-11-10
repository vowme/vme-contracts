// Tests for VMEToken.sol
// One contract for each state in our state machine
// At least one "it" for each function call
// States: Before Crowdsale, During Crowdsale, Successful Crowdsale, Failed Crowdsale
// Functions: transfer, upgrade, setUpgradeAgent, setUpgradeMaster, invest, refund, allowance, finalizeCrowdfunding, totalSupply, balanceOf, allowance

let utils = require('./utils/utils.js');
let BigNumber = require('bignumber.js');

// contracts
let MultiSigWallet = artifacts.require('MultiSigWallet');
let VMEToken = artifacts.require('VMEToken');
let NewToken = artifacts.require('NewToken');
let UpgradeAgent = artifacts.require('UpgradeAgent');
let VMEVault = artifacts.require('VMEVault');

contract('Crowdsale', function(accounts){
  let prefix = 'Before Crowdsale -- ';
  // ---------------------------------------------
  // ------------- BEFORE CROWDSALE --------------
  // ---------------------------------------------
  it(prefix + 'getFundingState returns PreFunding', function(done) {
    let upgradeMaster, fundingStartBlock, fundingEndBlock, vmeToken;
    
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 10;
      fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(instance){
      vmeToken = instance;
      return utils.assertThrows(VMEToken.new(accounts[0], upgradeMaster, fundingStartBlock, fundingEndBlock), 'cannot create token with fake wallet');
    }).then(function(){
      return vmeToken.getFundingState();
    }).then(function(state){
      assert.equal(state, utils.crowdsaleState.PREFUNDING);
    }).then(done).catch(done);
  });
  it(prefix + 'disallows transfer', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.transfer(accounts[1], 1), 'expected transfer to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows transferFrom', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.transferFrom(accounts[0], accounts[1], 1), 'expected transferFrom to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows upgrade', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.upgrade(1), 'expected upgrade to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows approve', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.approve(accounts[1], 1), 'expected approve to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeAgent', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.setUpgradeAgent(accounts[2]), 'expected setUpgradeAgent to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeMaster', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.setUpgradeMaster(accounts[1]), 'expected setUpgradeMaster to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows invest', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      let catched = false;
      try {
        web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: web3.toWei(0.5, 'ether'), gas: 300000});
      } catch (e) {
        assert.include(e.message, 'invalid opcode');
        catched = true;
      }
      if (!catched) {
        assert.isNotOk(true, 'expected invest to fail');
      }
    }).then(done).catch(done);
  });
  it(prefix + 'disallows refund', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.refund({from: accounts[2]}), 'expected refund to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows finalizeCrowdfunding', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.finalizeCrowdfunding(), 'expected finalizeCrowdfunding to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows totalSupply, which is 0', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return vmeToken.totalSupply();
    }).then(function(supply){
      assert.equal(supply.toString(10), '0');
    }).then(done).catch(done);
  });
  it(prefix + 'allows balanceOf, which is 0', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      let balances = [];
      for (let i = 0; i < accounts.length; i++) {
        balances[i] = vmeToken.balanceOf(accounts[i]);
      }
      return Promise.all(balances);
    }).then(function(balances){
      for (let i = 0; i < balances.length; i++) {
        assert.equal(balances[i].toString(10), '0');
      }
    }).then(done).catch(done);
  });
  it(prefix + 'disallows approve', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      return utils.assertThrows(vmeToken.approve(accounts[1], 1), 'expected approve to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows allowance, which is 0', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 10;
      const fundingEndBlock = fundingStartBlock + 1;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      let allowances = [];
      for (let i = 0; i < accounts.length; i++) {
        for (let j = 0; j < accounts.length; j++) {
          if (i != j) {
            allowances.push(vmeToken.allowance(accounts[i], accounts[j]));
          }
        }
      }
      return Promise.all(allowances);
    }).then(function(allowances){
      for (let i = 0; i < allowances.length; i++) {
        assert.equal(allowances[i].toString(10), '0');
      }
    }).then(done).catch(done);
  });
  // // // // ---------------------------------------------
  // // // // ------------- DURING CROWDSALE --------------
  // // // // ---------------------------------------------
  prefix = 'During Crowdsale -- ';
  it(prefix + 'getFundingState returns Funding', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.getFundingState();
    }).then(function(state){
      return assert.equal(state, utils.crowdsaleState.FUNDING);
    }).then(done).catch(done);
  });
  it(prefix + 'disallows transfer', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.transfer(accounts[1], 1), 'expected transfer to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows transferFrom', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.transferFrom(accounts[0], accounts[1], 1), 'expected transferFrom to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows upgrade', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.upgrade(1), 'expected upgrade to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows approve', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.approve(accounts[1], 1), 'expected approve to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeAgent', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.setUpgradeAgent(accounts[2]), 'expected setUpgradeAgent to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeMaster', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      return utils.assertThrows(vmeToken.setUpgradeMaster(accounts[1]), 'expected setUpgradeMaster to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows invest', function(done) {
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      const fundingStartBlock = web3.eth.blockNumber + 2;
      const fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineOneBlock();
      utils.mineOneBlock();
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: web3.toWei(0.1, 'ether'), gas: 300000});
    }).then(done).catch(done);
  });
  it(prefix + 'disallows creation of too many tokens', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMaxGoal();
    }).then(function(maxWeiForSuccess){
      let catched = false;
      try {
        web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: maxWeiForSuccess.add(1), gas: 300000});
      } catch (e) {
        assert.include(e.message, 'invalid opcode');
        catched = true;
      }
      if (!catched) {
        assert.isNotOk(true, 'expected invest to fail');
      }
    }).then(done).catch(done);
  });
  it(prefix + 'disallows refund', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 3;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: web3.toWei(0.5, 'ether'), gas: 300000});
    }).then(function(){
      return vmeToken.balanceOf(accounts[2]);
    }).then(function(balance){
      assert.notEqual(balance.toString(10), '0');
      return utils.assertThrows(vmeToken.refund({from: accounts[2]}), 'expected refund to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'disallows finalizeCrowdfunding', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineToBlockHeight(fundingStartBlock);
      return utils.assertThrows(vmeToken.finalizeCrowdfunding(), 'expected finalizeCrowdfunding to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows totalSupply', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: web3.toWei(0.1, 'ether'), gas: 300000});
    }).then(function(){
      return vmeToken.totalSupply();
    }).then(function(supply){
      return vmeToken.tokensPerEther().then(function(tokensPerEther){
        return vmeToken.fundingBonus1().then(function(bonus) {
          let baseSupply = tokensPerEther.mul(web3.toWei(0.1, 'ether'));
          let bonusSupply = baseSupply.mul(bonus).div(100);
          assert.equal(
            supply.toString(10),
            baseSupply.add(bonusSupply).toString(10)
          );
        })
      });
    }).then(done).catch(done);
  });
  it(prefix + 'allows balanceOf', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: web3.toWei(0.1, 'ether'), gas: 300000});
    }).then(function(){
      return vmeToken.balanceOf(accounts[2]);
    }).then(function(balance){
      return vmeToken.tokensPerEther().then(function(tokensPerEther){
        return vmeToken.fundingBonus1().then(function(bonus) {
          let baseSupply = tokensPerEther.mul(web3.toWei(0.1, 'ether'));
          let bonusSupply = baseSupply.mul(bonus).div(100);
          assert.equal(
            balance.toString(10),
            baseSupply.add(bonusSupply).toString(10)
          );
        })
      });
    }).then(done).catch(done);
  });
  it(prefix + 'disallows approve', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineToBlockHeight(fundingStartBlock);
      utils.assertThrows(vmeToken.approve(accounts[1], 1), 'expected approve to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows allowance, which is 0', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 10;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      let allowances = [];
      utils.mineToBlockHeight(fundingStartBlock);
      for (let i = 0; i < accounts.length; i++) {
        for (let j = 0; j < accounts.length; j++) {
          if (i != j) {
            allowances.push(vmeToken.allowance(accounts[i], accounts[j]));
          }
        }
      }
      return Promise.all(allowances);
    }).then(function(allowances){
      for (let i = 0; i < allowances.length; i++) {
        assert.equal(allowances[i].toString(10), '0');
      }
    }).then(done).catch(done);
  });
  // // // // ---------------------------------------------
  // // // // ------------- SUCCESSFUL CROWDSALE ----------
  // // // // ---------------------------------------------
  prefix = 'Successful Crowdsale -- ';
  it(prefix + 'getFundingState returns Success after fundingMaxGoal', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMaxGoal();
    }).then(function(maxWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: maxWeiForSuccess, gas: 300000});
    }).then(function(){
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return vmeToken.getFundingState();
    }).then(function(state){
      assert.equal(state, utils.crowdsaleState.SUCCESS);
    }).then(done).catch(done);
  });
  it(prefix + 'getFundingState returns Success after fundingEndBlock', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return vmeToken.getFundingState();
    }).then(function(state){
      assert.equal(state, utils.crowdsaleState.SUCCESS);
    }).then(done).catch(done);
  });
  it(prefix + 'allows transfer and balanceOf', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    let vmeToken;
    let balanceBeforeTransfer;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[2], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return vmeToken.balanceOf(accounts[2]);
    }).then(function(balance){
      balanceBeforeTransfer = balance;
      return vmeToken.transfer(accounts[1], 1, {from: accounts[2]});
    }).then(function(){
      return vmeToken.balanceOf(accounts[1]);
    }).then(function(balance){
      assert.equal(balance.toString(10), '1');
      return vmeToken.balanceOf(accounts[2]);
    }).then(function(balance){
      assert.equal(balance.sub(balanceBeforeTransfer.sub(1)).toString(10), '0');
    }).then(done).catch(done);
  });
  it(prefix + 'allows upgrade', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let upgradeMaster;
    let vmeToken;
    let newToken;
    let upgradeAgent;
    let agentOwner;
    let holderBalance;
    let upgradeGasEstimate;
    let finalizeGasEstimate;

    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      upgradeMaster = accounts[0];
      agentOwner = upgradeMaster;
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(instance){
      vmeToken = instance;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      // success
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      // can't upgrade before we set the upgradeAgent
      utils.assertThrows(vmeToken.upgrade(1, {from: accounts[0]}), 'expected upgrade to fail')
      return vmeToken.getFundingState();
    }).then(function(state){
      assert.equal(state, utils.crowdsaleState.SUCCESS);
      return UpgradeAgent.new(vmeToken.address, {from: agentOwner});
    }).then(function(agent){
      upgradeAgent = agent;
      return utils.assertThrows(vmeToken.setUpgradeAgent(upgradeAgent.address, {from: upgradeMaster}), 'expected setUpgradeAgent to fail');
    }).then(function(){
      return vmeToken.upgradeAgent();
    }).then(function(address){
      assert.equal(address, '0x0000000000000000000000000000000000000000');
      return upgradeAgent.setOriginalSupply();
    }).then(function(){
      return vmeToken.setUpgradeAgent(upgradeAgent.address, {from: upgradeMaster});
    }).then(function(){
      return vmeToken.upgradeAgent();
    }).then(function(address){
      assert.equal(address, upgradeAgent.address);
      return upgradeAgent.owner();
    }).then(function(owner){
      // check that the owner is who we think it should be
      assert.equal(owner, agentOwner);
      return NewToken.new(upgradeAgent.address);
    }).then(function(newTok){
      newToken = newTok;
      return newToken.upgradeAgent();
    }).then(function(agent){
      // in == out
      assert.equal(agent, upgradeAgent.address);
      return newToken.balanceOf(upgradeAgent.address);
    }).then(function(balance){
      // empty before doing anything
      assert.equal(balance.toString(10), '0');
      return upgradeAgent.originalSupply();
    }).then(function(originalSupply){
      return vmeToken.totalSupply().then(function(actualSupply){
        // does the original supply match our known supply?
        assert.equal(originalSupply.toString(10), actualSupply.toString(10));
      });
    }).then(function(){
      return upgradeAgent.oldToken();
    }).then(function(oldToken){
      // does the oldToken match the token we gave it?
      assert.equal(oldToken, vmeToken.address);
      return upgradeAgent.setNewToken(newToken.address, {from: agentOwner});
    }).then(function(){
      return upgradeAgent.newToken();
    }).then(function(newTok){
      // does the newToken match the one we gave it?
      assert.equal(newTok, newToken.address);
      functionData = utils.getFunctionEncoding('upgrade(uint256)', [1]);
      return web3.eth.estimateGas({to: vmeToken.address, data: functionData});
    }).then(function(gasEstimate){
      upgradeGasEstimate = gasEstimate + utils.gasEpsilon;
      return vmeToken.balanceOf(accounts[0]);
    }).then(function(balance){
      holderBalance = balance;
      return vmeToken.upgrade(balance, {from: accounts[0], gas: upgradeGasEstimate});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 2);
      assert.equal(receipt.logs[0].event, 'Transfer');
      assert.equal(receipt.logs[1].event, 'Upgrade');
      return newToken.balanceOf(accounts[0]);
    }).then(function(balance){
      assert.equal(balance.toString(10), holderBalance.toString(10));
      return vmeToken.balanceOf(accounts[0]);
    }).then(function(balance){
      assert.equal(balance.toString(10), '0');
    }).then(function(){
      // can't upgrade 0 tokens
      utils.assertThrows(vmeToken.upgrade(0, {from: accounts[0], gas: upgradeGasEstimate}), 'expected upgrade to fail because 0');
    }).then(function(){
      // can't upgrade tokens you don't have
      utils.assertThrows(vmeToken.upgrade(1, {from: accounts[1], gas: upgradeGasEstimate}), 'expected upgrade to fail because too much');
    }).then(function(){
      // can't upgrade tokens you don't have
      utils.assertThrows(vmeToken.upgrade(1, {from: accounts[0], gas: upgradeGasEstimate}), 'expected upgrade to fail because too much');
    }).then(function(){
      // can't finalizeUpgrade unless you are agentOwner
      utils.assertThrows(upgradeAgent.finalizeUpgrade({from: accounts[1]}), 'expected finalizeUpgrade to fail');
      functionData = utils.getFunctionEncoding('finalizeUpgrade()', []);
      return web3.eth.estimateGas({to: upgradeAgent.address, data: functionData});
    }).then(function(gasEstimate){
      finalizeGasEstimate = gasEstimate + utils.gasEpsilon;
      return upgradeAgent.finalizeUpgrade({from: agentOwner, gas: finalizeGasEstimate});
    }).then(function(){
      return upgradeAgent.upgradeFinalized();
    }).then(function(finalized){
      assert.equal(finalized, true);
      return newToken.upgradeFinalized();
    }).then(function(finalized){
      assert.equal(finalized, true);
      // can't finalizeUpgrade twice
      utils.assertThrows(upgradeAgent.finalizeUpgrade({from: agentOwner, gas: finalizeGasEstimate}), 'expected finalizeUpgrade to fail');
    }).then(function(){
      // can't upgrade after finalized
      utils.assertThrows(vmeToken.upgrade(1, {from: accounts[0]}), 'expected upgrade to fail because finalized');
    }).then(function(){
      return vmeToken.upgradedTotal();
    }).then(function(upgradedTotal){
      assert.equal(upgradedTotal.toString(10), holderBalance.toString(10));
    }).then(done).catch(done);
  });
  it(prefix + 'allows setUpgradeAgent', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let upgradeMaster;
    let vmeToken;
    let agentOwner;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      upgradeMaster = accounts[0];
      agentOwner = upgradeMaster;
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(instance){
      vmeToken = instance;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      // success
      utils.mineToBlockHeight(fundingEndBlock);
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return UpgradeAgent.new(vmeToken.address, {from: agentOwner});
    }).then(function(agent){
      upgradeAgent = agent;
      return upgradeAgent.setOriginalSupply();
    }).then(function(){
      return vmeToken.setUpgradeAgent(upgradeAgent.address, {from: upgradeMaster});
    }).then(function() {
      return vmeToken.upgradeAgent();
    }).then(function(agent){
      assert.equal(upgradeAgent.address, agent);
    }).then(function(){
      // can't do it from non-upgradeMaster
      utils.assertThrows(vmeToken.setUpgradeAgent(upgradeAgent.address, {from: accounts[3]}), 'must setUpgradeAgent from upgradeMaster');
    }).then(function(){
      // can't set it to some random address
      utils.assertThrows(vmeToken.setUpgradeAgent(accounts[3], {from: upgradeMaster}), 'must setUpgradeAgent to an actual UpgradeAgent');
    }).then(function(){
      // can't set upgrade agent to 0
      utils.assertThrows(vmeToken.setUpgradeAgent(0), 'must setUpgradeAgent to non-zero address');
    }).then(done).catch(done);
  });
  it(prefix + 'allows setUpgradeMaster', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let upgradeMaster;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      // success
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      utils.assertThrows(vmeToken.setUpgradeMaster(accounts[2], {from: accounts[3]}), 'expected setUpgradeMaster to fail');
    }).then(function(){
      utils.assertThrows(vmeToken.setUpgradeMaster(0), 'expected setUpgradeMaster to fail');
    }).then(function(){
      return vmeToken.setUpgradeMaster(accounts[1], {from: upgradeMaster})
    }).then(function(){
      return vmeToken.upgradeMaster();
    }).then(function(master){
      assert.equal(master, accounts[1]);
    }).then(done).catch(done);
  });
  it(prefix + 'disallows invest', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      // success
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      let catched = false;
      try {
        web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: 1, gas: 300000});
      } catch (e) {
        assert.include(e.message, 'invalid opcode');
        catched = true;
      }
      if (!catched) {
        assert.isNotOk(true, 'expected invest to fail');
      }
    }).then(done).catch(done);
  });
  it(prefix + 'disallows refund', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      // success
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      utils.assertThrows(vmeToken.refund(), 'expected refund to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'allows finalizeCrowdfunding', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      // success
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      utils.assertThrows(vmeToken.finalizeCrowdfunding(), 'expected finalizeCrowdfunding to fail');
    }).then(done).catch(done);
  });
  it(prefix + 'vault works correctly', function(done){
    let fundingStartBlock;
    let fundingEndBlock;
    let upgradeMaster = accounts[0];
    let vmeVault;
    let vowmeMultisig;
    let vmeToken;
    let minWeiForSuccess;
    MultiSigWallet.new(accounts, 2).then(function(instance){
      vowmeMultisig = instance;
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(instance){
      vmeToken = instance;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWei){
      minWeiForSuccess = minWei;
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      return vmeToken.vowmeTimeVault();
    }).then(function(vaultAddress){
      return VMEVault.at(vaultAddress);
    }).then(function(vault){
      vmeVault = vault;
      return vmeToken.balanceOf(vmeVault.address);
    }).then(function(balance){
      assert.equal(balance.toString(10), '0');
      // success
      utils.mineToBlockHeight(fundingEndBlock);
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return web3.eth.getBalance(vowmeMultisig.address);
    }).then(function(balance){
      let catched = false;
      assert.equal(balance.toString(10), minWeiForSuccess.toString(10));
      try {
        web3.eth.sendTransaction({from: accounts[2], to: vmeVault.address, value: web3.toWei(1, 'ether')});
      } catch (e) {
        assert.include(e.message, 'invalid opcode');
        catched = true;
      }
      if (!catched) {
        assert.isNotOk(true, 'expected sendTransaction to fail');
      }
    }).then(function(){
      return web3.eth.getBalance(vmeVault.address);
    }).then(function(balance){
      assert.equal(balance.toString(10), '0');
      return vmeToken.balanceOf(vmeVault.address);
    }).then(function(balance){
      return vmeToken.totalSupply().then(function(supply){
        // check our 25% endowment
        assert.equal(balance.toString(10), supply.mul(0.25).floor().toString(10));
      });
    }).then(function(){
      // can't unlock until it's time
      return utils.assertThrows(vmeVault.unlock(), 'expected unlock to fail');
    }).then(function(){
      // mine to block height to unlock vault
      utils.mineToBlockHeight(web3.eth.blockNumber + utils.numBlocksLocked);
    }).then(function(){
      // unlock should be enabled now
      return vmeVault.unlock();
    }).then(function(){
      return vmeToken.balanceOf(vmeVault.address);
    }).then(function(balance){
      // should be 0, we just unlocked it all
      assert.equal(balance.toString(10), '0');
      return vmeToken.balanceOf(vowmeMultisig.address);
    }).then(function(balance){
      // we transfered our vme to the multisig wallet
      return vmeToken.totalSupply().then(function(supply){
        // check our 25%+10% endowment
        assert.equal(balance.toString(10), supply.mul(0.25).floor().add(supply.mul(0.10).floor()).toString(10));
      });
    }).then(done).catch(function(){
      console.log('Did you forget to change the lock time in VMEVault.sol?');
      assert.fail();
    });
  });
  it(prefix + 'allows totalSupply', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMaxGoal();
    }).then(function(maxWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: maxWeiForSuccess, gas: 300000});
    }).then(function(){
      return vmeToken.totalSupply();
    }).then(function(totalSupply){
      assert.equal(totalSupply.toString(10), '3600000000000000000000');
    }).then(function(){
      // success, this creates a 35% endowment
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      return vmeToken.totalSupply();
    }).then(function(totalSupply){
      let totalSupplyBeforeEndowment = new BigNumber('3600000000000000000000');
      assert.equal(totalSupply.toString(10), totalSupplyBeforeEndowment.add(totalSupplyBeforeEndowment.mul(25).div(65).floor().add(totalSupplyBeforeEndowment.mul(10).div(65).floor())).toString(10));
    }).then(done).catch(done);
  });
  it(prefix + 'approve, allowance and transferFrom enabled', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    let initBalance;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      return vmeToken.fundingMinGoal();
    }).then(function(minWeiForSuccess){
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: minWeiForSuccess, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock);
      return vmeToken.finalizeCrowdfunding();
    }).then(function(){
      // let 1 spend 0's money
      return vmeToken.approve(accounts[1], 2, {from: accounts[0]});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1);
      assert.equal(receipt.logs[0].event, 'Approval');
      return vmeToken.allowance(accounts[0], accounts[1]);
    }).then(function(allowance){
      assert.equal(allowance.toNumber(), 2);
      return vmeToken.allowance(accounts[1], accounts[0]);
    }).then(function(allowance){
      assert.equal(allowance.toNumber(), 0);
      return vmeToken.balanceOf(accounts[0]);
    }).then(function(balance){
      initBalance = balance;
      // 1 will send 2 tokens from 0 to 2
      return vmeToken.transferFrom(accounts[0], accounts[2], 2, {from: accounts[1]});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1);
      assert.equal(receipt.logs[0].event, 'Transfer')
      // this fails because we already depleted our allowance
      return utils.assertThrows(vmeToken.transferFrom(accounts[0], accounts[2], 2, {from: accounts[1]}), 'expected transferFrom to fail');
    }).then(function(){
      vmeToken.approve(accounts[1], 2, {from: accounts[0]});
    }).then(function(){
      return utils.assertThrows(vmeToken.transferFrom(accounts[0], accounts[2], 3, {from: accounts[1]}), 'expected transferFrom to fail');
    }).then(function(){
      return vmeToken.balanceOf(accounts[2]);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 2);
      return vmeToken.balanceOf(accounts[0]);
    }).then(function(balance){
      assert.equal(balance.sub(initBalance.sub(2)).toNumber(), 0);
    }).then(done).catch(done);
  });
  // // // ---------------------------------------------
  // // // ------------- FAILED CROWDSALE --------------
  // // // ---------------------------------------------
  prefix = 'Failed Crowdsale -- ';
  it(prefix + 'getFundingState returns Failed after fundingEndBlock', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      utils.mineToBlockHeight(fundingEndBlock + 1);
      // failure
      return vmeToken.getFundingState();
    }).then(function(state){
      assert.equal(state, utils.crowdsaleState.FAILURE);
    }).then(done).catch(done);
  });
  it(prefix + 'allows refund', function(done) {
    let fundingStartBlock = 0;
    let fundingEndBlock = 0;
    const refundee = accounts[4];
    const gasPrice = 2e10; // 20 gwei
    let gasUsed = 0;
    let initialBalance;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      initialBalance = web3.eth.getBalance(refundee);
      return web3.eth.sendTransaction({from: refundee, to: vmeToken.address, value: 60000, gas: 300000, gasPrice: gasPrice});
    }).then(function(txId){
      gasUsed += web3.eth.getTransactionReceipt(txId).gasUsed;
      // failure
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.refund({from: accounts[0]}), 'expected refund to fail');
    }).then(function(){
      return vmeToken.refund({from: refundee, gasPrice: gasPrice});
    }).then(function(receipt){
      gasUsed += receipt.receipt.gasUsed;
      newBalance = web3.eth.getBalance(refundee);
      gasDiff = gasUsed * gasPrice;
      assert.equal(initialBalance.sub(newBalance).toNumber() - gasDiff, 0);
      return vmeToken.balanceOf(refundee);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 0);
    }).then(done).catch(done);
  });
  it(prefix + 'disallows transfer', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: 1, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.transfer(accounts[1], 1, {from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'disallows upgrade', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(token){
      vmeToken = token;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: 1, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.upgrade(1, {from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeAgent', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      // failure
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.setUpgradeAgent(accounts[1], {from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'disallows setUpgradeMaster', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      // failure
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.setUpgradeMaster(accounts[1], {from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'disallows invest', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      // failure
      let catched = false;
      utils.mineToBlockHeight(fundingEndBlock + 1);
      try {
        web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: 1, gas: 300000});
      } catch (e) {
        assert.include(e.message, 'invalid opcode');
        catched = true;
      }
      if (!catched) {
        assert.isNotOk(true, 'expected invest to fail');
      }
    }).then(done).catch(done);
  });
  it(prefix + 'disallows finalizeCrowdfunding', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      // failure
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.finalizeCrowdfunding({from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'disallows approve', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(vmeToken){
      // failure
      utils.mineToBlockHeight(fundingEndBlock + 1);
      utils.assertThrows(vmeToken.approve(accounts[1], 1, {from: accounts[0]}));
    }).then(done).catch(done);
  });
  it(prefix + 'allows totalSupply', function(done) {
    let fundingStartBlock;
    let fundingEndBlock;
    let vmeToken;
    let tokensPerEther;
    MultiSigWallet.new(accounts, 2).then(function(vowmeMultisig){
      const upgradeMaster = accounts[0];
      fundingStartBlock = web3.eth.blockNumber + 2;
      fundingEndBlock = fundingStartBlock + 4;
      return VMEToken.new(vowmeMultisig.address, upgradeMaster, fundingStartBlock, fundingEndBlock);
    }).then(function(instance){
      vmeToken = instance;
      utils.mineToBlockHeight(fundingStartBlock);
      web3.eth.sendTransaction({from: accounts[0], to: vmeToken.address, value: 1, gas: 300000});
    }).then(function(){
      utils.mineToBlockHeight(fundingEndBlock + 1);
      return vmeToken.tokensPerEther();
    }).then(function(rate){
      tokensPerEther = rate;
      return vmeToken.totalSupply();
    }).then(function(supply){
      assert.equal(supply.toNumber(), tokensPerEther.add(200).toNumber()); // bonus
      return vmeToken.balanceOf(accounts[0]);
    }).then(function(balance){
      assert.equal(balance.toNumber(), tokensPerEther.add(200).toNumber()); // bonus
    }).then(done).catch(done);
  });
});

contract('Token', function(accounts) {
  it("should be successfull", function(done) {
    let vowmeMultisig;
    let upgradeMaster = accounts[0];
    let fundingStartBlock;
    let fundingEndBlock;
    let vowmeToken;
    let vowmeTimeVault;

    MultiSigWallet.new(accounts, 2).then(function(instance){
      vowmeMultisig = instance.address;
      return instance.isMultiSigWallet();
    }).then(function(isMultiSigWallet) {
      assert.equal(isMultiSigWallet, true);
    }).then(function(){
      fundingStartBlock = web3.eth.blockNumber + 10;
      fundingEndBlock = web3.eth.blockNumber + 20;
      VMEToken.new(vowmeMultisig, upgradeMaster, fundingStartBlock, fundingEndBlock).then(function(instance){
        vowmeToken = instance;
        return instance.owner();
      }).then(function(owner){
        assert.equal(owner, accounts[0]);
        return vowmeToken.vowmeTimeVault();
      }).then(function(timeVaultAddress){
        vowmeTimeVault = timeVaultAddress;
        utils.mineToBlockHeight(fundingStartBlock);
        return vowmeToken.getFundingState();
      }).then(function(state){
        assert.equal(state, utils.crowdsaleState.FUNDING);
      }).then(function(){
        web3.eth.sendTransaction({from: accounts[1], to: vowmeToken.address, value: web3.toWei(0.6, 'ether'), gas: 300000});
        return vowmeToken.balanceOf(accounts[1]);
      }).then(function(balance){
        assert.equal(balance, '720000000000000000000');
        web3.eth.sendTransaction({from: accounts[2], to: vowmeToken.address, value: web3.toWei(0.5, 'ether'), gas: 300000});
        return vowmeToken.balanceOf(accounts[2]);
      }).then(function(balance){
        assert.equal(balance.toString(10), '550000000000000000000');
        assert.equal(web3.eth.getBalance(vowmeToken.address), web3.toWei(1.1, 'ether'));
        utils.mineToBlockHeight(fundingEndBlock + 1);
        return vowmeToken.totalSupply();
      }).then(function(totalSupply){
        assert.equal(totalSupply.toString(10), '1270000000000000000000');
        return vowmeToken.getFundingState();
      }).then(function(state){
        assert.equal(state, utils.crowdsaleState.SUCCESS);
        utils.assertThrows(vowmeToken.finalizeCrowdfunding({from: accounts[1]}), 'expected finalizeCrowdfunding to fail');
        return vowmeToken.finalizeCrowdfunding();
      }).then(function(){
        assert.equal(web3.eth.getBalance(vowmeToken.address), 0);
        assert.equal(web3.eth.getBalance(vowmeMultisig), web3.toWei(1.1, 'ether'));
        utils.assertThrows(vowmeToken.finalizeCrowdfunding(), 'expected finalizeCrowdfunding to fail');
        return vowmeToken.balanceOf(vowmeTimeVault);
      }).then(function(balance) {
        assert.equal(balance.toString(10), '488461538461538461538');
        return vowmeToken.balanceOf(vowmeMultisig);
      }).then(function(balance) {
        assert.equal(balance.toString(10), '195384615384615384615');
        return vowmeToken.totalSupply();
      }).then(function(totalSupply) {
        assert.equal(totalSupply.toString(10), '1953846153846153846153');
        utils.assertThrows(vowmeToken.refund({from: accounts[1]}), 'expected refund to fail');
        return vowmeToken.promisesAllowed();
      }).then(function(promisesAllowed) {
        assert.equal(promisesAllowed, false);
        return vowmeToken.promisesAllow();
      }).then(function() {
        return vowmeToken.promisesAllowed();
      }).then(function(promisesAllowed) {
        assert.equal(promisesAllowed, true);

        //console.log(web3.eth.getBlock(web3.eth.blockNumber).timestamp);
        //utils.increaseTime(1000);
        //utils.mineOneBlock();
        //console.log(web3.eth.getBlock(web3.eth.blockNumber).timestamp);

        let donatorId = 0;
        let promiseId = 123;
        let expirationDate = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 3600;
        
        let code = (new BigNumber(2)).pow(64).mul(donatorId).plus((new BigNumber(promiseId)).mul(2**32)).plus(expirationDate);

        return vowmeToken.initialize(100, code, {from: accounts[1]});
      }).then(function() {
        return vowmeToken.balanceOf(accounts[1]);
      }).then(function(balance) {
        assert.equal(balance.toString(10), '719999999999999999900');
        return vowmeToken.promiseBalance(123);
      }).then(function(balance) {
        assert.equal(balance.toString(10), '100');
        
        let donatorId = 10;
        let promiseId = 123;
        let code = ((new BigNumber(promiseId)).mul(2**32)).plus(donatorId);

        return vowmeToken.donate(50, code, {from: accounts[2]});
      }).then(function(receipt) {
        return vowmeToken.statDonatorPromiseSum(10, 123);
      }).then(function(sum) {
        assert.equal(sum.toString(10), '50');

        utils.increaseTime(3600);
        utils.mineOneBlock();

        let donatorId = 10;
        let promiseId = 123;
        let code = ((new BigNumber(promiseId)).mul(2**32)).plus(donatorId);

        return vowmeToken.kept(code, {from: accounts[2]});
      }).then(function() {
        return vowmeToken.donatorPromiseRate(10, 123);
      }).then(function(rate) {
        assert.equal(rate.toString(10), '3');

        let promiseId = 123;
        let denyDonations = 1;
        let code = denyDonations * 2**32 + promiseId;

        return vowmeToken.move(code, 150, accounts[1]);
      }).then(function() {
        let promiseId = 123;
        let expirationDate = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1209600;
        let code = ((new BigNumber(promiseId)).mul(2**32)).plus(expirationDate);

        return vowmeToken.proofLoaded(code);
      }).then(function() {
        return vowmeToken.getFree({from: accounts[4]});
      }).then(function() {
        return vowmeToken.balanceOf(accounts[4]);
      }).then(function(balance) {
        assert.equal(balance.toString(10), '10000000000000000');
      }).then(done).catch(done);
    });
  });
});