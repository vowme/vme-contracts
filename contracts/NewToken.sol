pragma solidity ^0.4.18;

import './ERC20.sol';
import './SafeMath.sol';

contract OldToken is ERC20 {
    // flag to determine if address is for a real contract or not
    bool public isVowmeToken;
}

contract NewToken is ERC20 {
    using SafeMath for uint256; // use safe math operations

    // flag to determine if address is for a real contract or not
    bool public isNewToken = false;

    // Token information
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

    bool public upgradeFinalized = false;

    // Upgrade information
    address public upgradeAgent;

    function NewToken(address _upgradeAgent) public {
        require(_upgradeAgent != address(0));
        isNewToken = true;
        upgradeAgent = _upgradeAgent;
    }

    // Upgrade-related methods
    function createToken(address _target, uint256 _amount) public {
        require(msg.sender == upgradeAgent);
        require(!upgradeFinalized);
        require(_amount != 0);

        balances[_target] = balances[_target].add(_amount);
        totalSupply = totalSupply.add(_amount);
        Transfer(_target, _target, _amount);
    }

    function finalizeUpgrade() external {
        require(msg.sender == upgradeAgent);
        require(!upgradeFinalized);
        // this prevents createToken from being called after finalized
        upgradeFinalized = true;
    }

    // ERC20 interface: transfer _value new tokens from msg.sender to _to
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0));
        require(_to != address(this)); // do not allow transfer to the token contract itself

        // SafeMath.sub will throw if there is not enough balance
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        // An event to make the transfer easy to find on the blockchain
        Transfer(msg.sender, _to, _value);

        return true;
    }

    // ERC20 interface: transfer _value new tokens from _from to _to
    function transferFrom(address _from, address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(_to != address(0));
        require(_to != address(this)); // do not allow transfer to the token contract itself

        uint256 allowance = allowed[_from][msg.sender];

        // Check is not needed because allowance.sub(_value)
        // will already throw if this condition is not met
        // require (_value <= allowance);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowance.sub(_value);
        
        // An event to make the transfer easy to find on the blockchain
        Transfer(_from, _to, _value);

        return true;
    }

    // ERC20 interface: delegate transfer rights of up to _value new tokens from
    // msg.sender to _spender
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // To change the approve amount you first have to reduce the addresses`
        // allowance to zero by calling `approve(_spender, 0)` if it is not
        // already 0 to mitigate the race condition described here:
        // https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(_value == 0 || allowed[msg.sender][_spender] == 0);
        
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    // ERC20 interface: returns the amount of new tokens belonging to _owner
    // that _spender can spend via transferFrom
    function allowance(address _owner, address _spender)
        public
        constant
        returns (uint256 remaining)
    {
        return allowed[_owner][_spender];
    }

    // ERC20 interface: returns the amount of new tokens belonging to _owner
    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    /// @dev Fallback function throws to avoid accidentally losing money
    function() public payable { require(false); }
}

// Test the whole process against this: https://www.kingoftheether.com/contract-safety-checklist.html
contract UpgradeAgent {
    using SafeMath for uint256; // use safe math operations

    // flag to determine if address is for a real contract or not
    bool public isUpgradeAgent = false;

    // Contract information
    address public owner;

    // Upgrade information
    bool public upgradeHasBegun = false;
    bool public upgradeFinalized = false;
    OldToken public oldToken;
    NewToken public newToken;
    uint256 public originalSupply; // the original total supply of old tokens

    event NewTokenSet(address _token);
    event UpgradeHasBegun();
    event InvariantCheck(uint256 _oldTokenSupply, uint256 _newTokenSupply, uint256 _originalSupply, uint256 _value);

    function UpgradeAgent(address _oldToken) public {
        require(_oldToken != 0);
        oldToken = OldToken(_oldToken);
        require(oldToken.isVowmeToken());
        owner = msg.sender;
        isUpgradeAgent = true;
    }

    /// @notice Check to make sure that the current sum of old and
    /// new version tokens is still equal to the original number of old version
    /// tokens
    /// @param _value The number of VME to upgrade
    function safetyInvariantCheck(uint256 _value) public {
        require(newToken.isNewToken()); // abort if new token contract has not been set
        uint oldSupply = oldToken.totalSupply();
        uint newSupply = newToken.totalSupply();
        InvariantCheck(oldSupply, newSupply, originalSupply, _value);
        require(oldSupply.add(newSupply) == originalSupply.sub(_value));
    }

    /// @notice Gets the original token supply in oldToken.
    /// Called by oldToken after reaching the success state
    function setOriginalSupply() external {
        originalSupply = oldToken.totalSupply();
    }

    /// @notice Sets the new token contract address
    /// @param _newToken The address of the new token contract
    function setNewToken(address _newToken) external {
        require(msg.sender == owner);
        require(_newToken != address(0));
        require(!upgradeHasBegun); // cannot change token after upgrade has begun
        newToken = NewToken(_newToken);
        require(newToken.isNewToken());
        NewTokenSet(newToken);
    }

    /// @notice Sets flag to prevent changing newToken after upgrade
    function setUpgradeHasBegun() internal {
        if (!upgradeHasBegun) {
            upgradeHasBegun = true;
            UpgradeHasBegun();
        }
    }

    /// @notice Creates new version tokens from the new token
    /// contract
    /// @param _from The address of the token upgrader
    /// @param _value The number of tokens to upgrade
    function upgradeFrom(address _from, uint256 _value) external {
        require(msg.sender == address(oldToken)); // only upgrade from oldToken
        require(newToken.isNewToken()); // need a real newToken!
        require(!upgradeFinalized); // can't upgrade after being finalized

        setUpgradeHasBegun();

        // Right here oldToken has already been updated, but corresponding
        // VME have not been created in the newToken contract yet
        safetyInvariantCheck(_value);

        newToken.createToken(_from, _value);

        // Right here totalSupply invariant must hold
        safetyInvariantCheck(0);
    }

    function finalizeUpgrade() external {
        require(msg.sender == owner);
        require(!upgradeFinalized);

        safetyInvariantCheck(0);

        upgradeFinalized = true;

        newToken.finalizeUpgrade();
    }

    /// @dev Fallback function throws to avoid accidentally losing money
    function() public payable { require(false); }

}