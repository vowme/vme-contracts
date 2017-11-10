pragma solidity ^0.4.18;

import './VMECrowdsale.sol';
import './UpgradeAgent.sol';

/// @title Upgrade part of the Vowme contract (may be required in the future)
contract VMEUpgrade is VMECrowdsale {
    // Flag to determine if address is for a real contract or not
    bool public isVowmeToken = false;

    UpAgent public upgradeAgent; // the address of upgrade contract
    address public upgradeMaster; // the address that will manage upgrades
    uint256 public upgradedTotal; // how many tokens are already upgraded

    event Upgrade(address indexed _from, address indexed _to, uint256 _value);
    event UpgradeAgentSet(address _agent);

    // Fix for the ERC20 short address attack
    // http://vessenes.com/the-erc20-short-address-attack-explained/
    modifier onlyPayloadSize(uint256 numwords) {
        assert(msg.data.length >= numwords * 32 + 4);
        _;
    }

    /// @dev The internal constructor for upgrade initialization.
    function VMEUpgrade(address _upgradeMaster) internal {
        require(_upgradeMaster != address(0));
        isVowmeToken = true;
        upgradeMaster = _upgradeMaster;
    }

    /// @notice Upgrade tokens to the new token contract.
    /// This shall be called by the tokens holder.
    /// @dev Required state: Success
    /// @param _value The number of tokens to upgrade
    function upgrade(uint256 _value)
        external
        onlyPayloadSize(1)
    {
        require(fundingFinalized); // tokens are upgradeable only after the funding is completed successfully
        require(upgradeAgent != address(0)); // need a real upgradeAgent address
        require(upgradeAgent.owner() != address(0));
        require(_value != 0); // validate input value

        // Update the balances here first before calling out (reentrancy)
        balances[msg.sender] = balances[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        upgradedTotal = upgradedTotal.add(_value);
        upgradeAgent.upgradeFrom(msg.sender, _value);

        // Notify listeners about this event
        Upgrade(msg.sender, upgradeAgent, _value);
    }

    /// @notice Set address of upgrade target contract and
    /// enable upgrade process.
    /// @dev Required state: Success
    /// @param _agent The address of the UpgradeAgent contract
    function setUpgradeAgent(address _agent)
        external
        onlyPayloadSize(1)
    {
        require(fundingFinalized); // tokens are upgradeable only after the funding is finished
        require(_agent != address(0)); // don't set agent to nothing
        require(msg.sender == upgradeMaster); // only a master can designate the next agent
        require(address(upgradeAgent) == 0 || !upgradeAgent.upgradeHasBegun()); // don't change the upgrade agent

        UpAgent newUpgradeAgent = UpAgent(_agent);

        // UpgradeAgent must be created and linked to VMEToken after crowdfunding is over
        require(newUpgradeAgent.originalSupply() == totalSupply);

        upgradeAgent = newUpgradeAgent;

        // Notify listeners about this event
        UpgradeAgentSet(_agent);
    }

    /// @notice Set address of upgrade master.
    /// @dev Required state: Success
    /// @param _master The address that will manage upgrades, not the upgradeAgent contract address
    function setUpgradeMaster(address _master)
        external
        onlyPayloadSize(1)
    {
        require(fundingFinalized); // tokens are upgradeable only after the funding is finished
        require(_master != address(0));
        require(msg.sender == upgradeMaster); // only a master can designate the next master
        upgradeMaster = _master;
    }

}