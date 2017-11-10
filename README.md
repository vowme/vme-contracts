# VowMe Contracts

This is the official repository for the crowdsale of VowMe tokens.


We use SafeMath.sol and ERC20.sol from Zeppelin (thanks!)

NewToken.sol is an example of a new token that we might upgrade to.

We have 1400+ lines of tests. There are two test files:
1. One tests the wallet
2. The other one tests the crowd-sale and token contracts.

Instructions
-------------
1. Open a terminal
2. [Install npm](http://lmgtfy.com/?q=how+to+install+npm)
3. Run "npm install -g truffle"
4. Clone the repository "git clone https://github.com/vowme/vme-contracts.git"
5. In the repository, run "npm install"
6. Run "truffle develop"
7. Type in "test"

If you don't want to run all the tests, you can just run individual ones

```
truffle develop
test ./test/VMEToken.js
```
