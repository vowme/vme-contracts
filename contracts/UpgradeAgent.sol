pragma solidity ^0.4.18;

/// @title Upgrade agent abstract
contract UpAgent {
    address public owner;
    uint256 public originalSupply; // the original total supply of old tokens
    bool public upgradeHasBegun;

    function upgradeFrom(address _from, uint256 _value) public;
}