pragma solidity ^0.4.18;

import './ERC20.sol';
import './Ownable.sol';
import './SafeMath.sol';
import './VMEVault.sol';
import './MultiSigWallet.sol';

/// @title Crowdsale part of the Vowme contract
contract VMECrowdsale is ERC20, Ownable {
    using SafeMath for uint256; // use safe math operations

    bool public fundingFinalized = false; // is crowdsale successful and finalized?
    uint256 public fundingStartBlock;     // crowdsale start block
    uint256 public fundingEndBlock;       // crowdsale end block
    //uint256 public constant fundingMinGoal = 2250 ether;  // min amount of funds to be raised
    //uint256 public constant fundingMaxGoal = 12250 ether; // max amount of funds to be raised
    
    uint256 public constant fundingMinGoal = 1 ether;  // for testing on testnet
    uint256 public constant fundingMaxGoal = 3 ether; // for testing on testnet

    //uint256 public constant fundingBonus1Cap = 1225 ether;   // funding level for the 20% bonus
    uint256 public constant fundingBonus1    = 20;           // 20%
    //uint256 public constant fundingBonus2Cap = 4287.5 ether; // funding level for the 10% bonus
    uint256 public constant fundingBonus2    = 10;           // 10%

    uint256 public constant fundingBonus1Cap = 0.5 ether; // for testing on testnet
    uint256 public constant fundingBonus2Cap = 1 ether; // for testing on testnet

    uint256 public constant tokensPerEther = 1000; // how many token units a buyer gets per eth
    uint256 public constant crowdPercentOfTotal = 65; // 65% - investors
    uint256 public constant vaultPercentOfTotal = 25; // 25% - founders (locked for 1 year)
    uint256 public constant vowmePercentOfTotal = 10; // 10% - reserve and bounty

    uint256 public fundingCollected; // amount of raised money in wei
    mapping (address => uint256) public fundingEthBalances; // we need to know this for a possible refund
    
    address public vowmeMultisig;   // Vowme's multisignature wallet
    VMEVault public vowmeTimeVault; // Vowme's time-locked vault

    enum State {PreFunding, Funding, Success, Failure} // crowdfunding state machine

    // `balances` is the map that contains the balance of each address
    mapping (address => uint256) balances;

    // `allowed` tracks any extra transfer rights as in all ERC20 tokens
    mapping (address => mapping (address => uint256)) allowed;

    /// Event for eth refund logging.
    /// @param _to Who receives refund.
    /// @param _value Weis refunded.
    event Refund(address indexed _to, uint256 _value);

    /// @dev Throws if state is not `Funding`.
    modifier fundingState() {
        require(getFundingState() == State.Funding);
        _;
    }

    /// @dev Throws if state is not `Success`.
    modifier successState() {
        require(getFundingState() == State.Success);
        _;
    }

    /// @dev Throws if state is not `Failure`.
    modifier failureState() {
        require(getFundingState() == State.Failure);
        _;
    }

    /// @dev The internal constructor for crowdsale initialization.
    function VMECrowdsale(
        address _vowmeMultisig,
        uint256 _fundingStartBlock,
        uint256 _fundingEndBlock
    ) internal {
        require(_vowmeMultisig != address(0));
        require(_fundingStartBlock > block.number);
        require(_fundingEndBlock > _fundingStartBlock);

        require(MultiSigWallet(_vowmeMultisig).isMultiSigWallet());

        vowmeTimeVault = new VMEVault(_vowmeMultisig);
        require(vowmeTimeVault.isVMEVault());

        vowmeMultisig = _vowmeMultisig;
        fundingStartBlock = _fundingStartBlock;
        fundingEndBlock = _fundingEndBlock;
    }

    /// @dev Fallback function can be used to buy tokens.
    function() public payable fundingState {
        invest();
    }

    /// @notice Create tokens when funding is active.
    /// @dev Required state: Funding
    /// @dev State transition: -> Funding Success (only if cap reached)
    function invest() public payable fundingState {
        require(msg.value != 0); // do not allow creating 0 tokens
        
        uint256 newFundingCollected = fundingCollected.add(msg.value);
        require(newFundingCollected <= fundingMaxGoal); // don't go over the limit!

        // Calculate bonus percentage
        uint256 bonus = 0;

        if (fundingCollected <= fundingBonus1Cap) {
            bonus = fundingBonus1; // percents
        } else if (fundingCollected <= fundingBonus2Cap) {
            bonus = fundingBonus2; // percents
        }

        // Multiply by exchange rate to get newly created token amount
        uint256 createdTokens = msg.value.mul(tokensPerEther);

        if (bonus > 0) {
            // Apply bonus
            createdTokens = createdTokens.add(createdTokens.mul(bonus).div(100));
        }

        // We are creating tokens, so increase the totalSupply
        totalSupply = totalSupply.add(createdTokens);

        // Assign new tokens to the sender
        balances[msg.sender] = balances[msg.sender].add(createdTokens);

        // Increase total collected sum and eth balance for the sender
        fundingCollected = newFundingCollected;
        fundingEthBalances[msg.sender] = fundingEthBalances[msg.sender].add(msg.value);

        // Token creation event logging
        Transfer(0, msg.sender, createdTokens);
    }

    /// @notice Finalize crowdfunding.
    /// @dev If cap was reached or crowdfunding has ended then:
    /// create VME for the Vowme Multisig and time vault,
    /// transfer ETH to the Vowme Multisig address.
    /// @dev Required state: Success
    function finalizeCrowdfunding() external successState onlyOwner {
        require(!fundingFinalized); // can't finalize twice

        // Prevent more creation of tokens
        fundingFinalized = true;

        // Endowment: 25% of total goes to vault, timelocked for 1 year
        uint256 vaultTokens = totalSupply.mul(vaultPercentOfTotal).div(crowdPercentOfTotal);
        balances[vowmeTimeVault] = balances[vowmeTimeVault].add(vaultTokens);
        Transfer(0, vowmeTimeVault, vaultTokens);

        // Endowment: 10% of total goes to VowMe for reserve and bounty
        uint256 vowmeTokens = totalSupply.mul(vowmePercentOfTotal).div(crowdPercentOfTotal);
        balances[vowmeMultisig] = balances[vowmeMultisig].add(vowmeTokens);
        Transfer(0, vowmeMultisig, vowmeTokens);

        totalSupply = totalSupply.add(vaultTokens).add(vowmeTokens);

        // Transfer ETH to VowMe's multisignature wallet
        require(vowmeMultisig.send(this.balance));
    }

    /// @notice Get back the ether sent during the funding in case the funding
    /// has not reached the minimum level.
    /// @dev Required state: Failure
    function refund() external failureState {
        uint256 vmeValue = balances[msg.sender];
        require(vmeValue != 0); // can't refund twice
        balances[msg.sender] = 0;
        totalSupply = totalSupply.sub(vmeValue);

        uint256 ethValue = fundingEthBalances[msg.sender];
        fundingEthBalances[msg.sender] = 0;
        Refund(msg.sender, ethValue);
        require(msg.sender.send(ethValue));
    }

    /// @notice This manages the crowdfunding state machine.
    /// We make it a function and do not assign the result to a variable
    /// so there is no chance of the variable being stale.
    function getFundingState() public constant returns (State) {
        // Once we reach success, lock in the state
        if (fundingFinalized) {
            return State.Success;
        }

        if (block.number < fundingStartBlock) {
            return State.PreFunding;
        } else if (block.number <= fundingEndBlock && fundingCollected < fundingMaxGoal) {
            return State.Funding;
        } else if (fundingCollected >= fundingMinGoal) {
            return State.Success;
        }
        
        return State.Failure;
    }
}