pragma solidity ^0.4.18;

interface VowMeToken {
    function transfer(address _to, uint256 _value) public returns (bool success);
    function balanceOf(address _owner) public constant returns (uint256 balance);
}

/// @title The time-locked vault of tokens which will be available after 365 days
contract VMEVault {
    // Flag to determine if address is for a real contract or not
    bool public isVMEVault = false;

    VowMeToken vowmeToken;   // VMEToken contract address
    address vowmeMultisig; // Multisignature wallet address
    uint256 public unlockedAtBlockNumber;

    // 2102400 blocks = 1 year * 365 days/year * 24 hours/day * 60 minutes/hour * 60 seconds/minute / 15 seconds/block
    //uint256 public constant numBlocksLocked = 2102400;
    uint256 public constant numBlocksLocked = 12; // smaller lock for testing

    modifier unlockAllowed() { // wait your turn!
        require(block.number >= unlockedAtBlockNumber &&
                unlockedAtBlockNumber > 0);
        _;
    }

    /// @notice Constructor function sets the Vowme multisignature wallet address.
    function VMEVault(address _vowmeMultisig) public {
        require(_vowmeMultisig != address(0));
        
        isVMEVault = true;
        vowmeToken = VowMeToken(msg.sender);
        vowmeMultisig = _vowmeMultisig;
        
        unlockedAtBlockNumber = block.number + numBlocksLocked; // 365 days of blocks later
        assert(unlockedAtBlockNumber >= block.number);
    }

    /// @notice Transfer locked tokens to Vowme's multisig wallet.
    function unlock() external unlockAllowed {
        // Will fail if allocation (and therefore toTransfer) is 0.
        require(vowmeToken.transfer(vowmeMultisig, vowmeToken.balanceOf(this)));
    }

}