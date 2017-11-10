pragma solidity ^0.4.18;

import './VMEUpgrade.sol';

/// @title Vowme crowdsale and token contract
contract VMEToken is VMEUpgrade {
    
    string public constant name = "VowMe Token";
    string public constant symbol = "VME";
    uint8 public constant decimals = 18;  // decimal places

    /// Event for token burn logging.
    /// @param _burner Who burns their tokens.
    /// @param _value Weis burned.
    event Burn(address indexed _burner, uint256 indexed _value);

    /// @dev The main entry point for contract creation.
    function VMEToken(
        address _vowmeMultisig,
        address _upgradeMaster,
        uint256 _fundingStartBlock,
        uint256 _fundingEndBlock
    ) VMECrowdsale(
        _vowmeMultisig,
        _fundingStartBlock,
        _fundingEndBlock
    ) VMEUpgrade(
        _upgradeMaster
    ) Ownable() public {
    }

    /// @notice Transfer `_value` VME tokens from sender's account
    /// `msg.sender` to provided account address `_to`.
    /// @notice This function is disabled during the funding.
    /// @dev Required state: Success
    /// @param _to The address of the recipient
    /// @param _value The number of VME to transfer
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value)
        public
        onlyPayloadSize(2)
        returns (bool success)
    {
        require(fundingFinalized); // tokens are transferable only after funding is finished successfully
        require(_to != address(0));
        require(_to != address(this)); // do not allow transfer to the token contract itself
        require(_to != address(upgradeAgent));

        // SafeMath.sub will throw if there is not enough balance
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        // An event to make the transfer easy to find on the blockchain
        Transfer(msg.sender, _to, _value);

        return true;
    }

    /// @notice Transfer `_value` VME tokens from sender `_from`
    /// to provided account address `_to`.
    /// @notice This function is disabled during the funding.
    /// @dev Required state: Success
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The number of VME to transfer
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value)
        public
        onlyPayloadSize(3)
        returns (bool success)
    {
        require(fundingFinalized); // tokens are transferable only after the funding is finished
        require(_to != address(0));
        require(_to != address(this)); // do not allow transfer to the token contract itself
        require(_to != address(upgradeAgent));

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

    /// @notice `msg.sender` approves `_spender` to spend `_value` tokens.
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value)
        public
        onlyPayloadSize(2)
        returns (bool success)
    {
        require(fundingFinalized); // tokens are transferable only after the funding is finished

        // To change the approve amount you first have to reduce the addresses`
        // allowance to zero by calling `approve(_spender, 0)` if it is not
        // already 0 to mitigate the race condition described here:
        // https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(_value == 0 || allowed[msg.sender][_spender] == 0);
        
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @dev Burns a specific amount of tokens.
    /// @param _value The amount of tokens to be burned.
    function burn(uint256 _value)
        external
        onlyPayloadSize(1)
    {
        require(fundingFinalized); // tokens are burnable only after the funding is finished
        require(_value != 0);

        address burner = msg.sender;
        balances[burner] = balances[burner].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(burner, _value);

        // Keep token balance tracking services happy by sending the burned amount to
        // "burn address", so that it will show up as a ERC-20 transaction
        // in etherscan, etc. as there is no standarized burn event yet
        Transfer(burner, 0, _value);
    }

    /// @dev Gets the balance of the specified address.
    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    /// @dev Function to check the amount of tokens that an owner allowed to a spender.
    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender)
        public
        constant
        returns (uint256 remaining)
    {
        return allowed[_owner][_spender];
    }




    // Functions for promises and donations (will be used after the service's web part is released):


    // Flag that determines if the promises functionality is permitted or not
    bool public promisesAllowed;
    
    // Expiration date (as a unix timestamp) for each promise
    mapping (uint32 => uint256) promiseExpirationDate;

    // Current balance of each promise
    mapping (uint32 => uint256) public promiseBalance;

    // The map that stores the flag for each promise that determines
    // if donations are permitted for the promise
    mapping (uint32 => bool) promiseDenyDonations;

    // The map that stores the amount of tokens
    // the specified donor transferred to the specified promise
    mapping (uint32 => mapping (uint32 => uint256)) public statDonatorPromiseSum;

    // The rate period (can be changed by the contract's owner)
    uint256 public ratePeriod = 1 weeks;

    // The service fee percentage (can be changed by the contract's owner)
    uint256 public feePercent = 0;

    // The map that stores the rating which
    // the specified donor has set to the specified promise
    // 1 = failed, 2 = not sure, 3 = kept
    mapping (uint32 => mapping (uint32 => uint8)) public donatorPromiseRate;

    // The map that stores the `true` flag for each address
    // that has requested an amount of free tokens to be able
    // to initialize its promise
    mapping (address => bool) freeRequested;

    // How many tokens have been requested through `getFree` function
    // (see below)
    uint256 public vmeGiftTotal;

    // How many tokens can be given out through `getFree` function.
    // This number can be changed by the owner if necessary (see below)
    uint256 public vmeGiftLimit = 100000;

    // Events for some of the functions described below
    event Initialize(address indexed _author, uint256 _amount, uint32 indexed _id, uint256 _expiration);
    event Donate(address indexed _donator, uint256 _amount, uint32 indexed _promiseId, uint32 indexed _donatorId);
    event Kept(address indexed _donator, uint32 indexed _promiseId, uint32 indexed _donatorId);
    event Failed(address indexed _donator, uint32 indexed _promiseId, uint32 indexed _donatorId);
    event Notsure(address indexed _donator, uint32 indexed _promiseId, uint32 indexed _donatorId);
    event Move(uint32 indexed _promiseId, address indexed _target, uint256 _amount);
    event ProofLoaded(uint32 indexed _promiseId, uint256 _newExpiration);
    event GetFree(address indexed _to);

    /// @notice Enables promises and donations functionality.
    /// Can be called only by the owner after a successful funding.
    function promisesAllow() external onlyOwner {
        require(fundingFinalized); // promises functions are enabled only after a successful funding
        require(!promisesAllowed);
        promisesAllowed = true;
    }

    /// @notice This function is called by the author of the promise
    /// to initialize the specified promise.
    /// @param _amount The number of tokens that the author donates to.
    /// @param _code The numeric code that stores the ID of the promise
    /// and it's expiration date (as a unix timestamp). The author will
    /// see the code on the promise's page after it's created.
    function initialize(uint256 _amount, uint256 _code)
        external
        onlyPayloadSize(2)
    {
        require(promisesAllowed); // promises functions must be enabled
        require(_amount != 0);
        require(_code != 0);

        uint32 promiseId = uint32(_code >> 32); // the promise ID (the second 32bit word of the _code variable)

        require(promiseExpirationDate[promiseId] == 0); // can't initialize twice

        // Store the promise expiration date (as a unix timestamp)
        promiseExpirationDate[promiseId] = _code & 0xFFFFFFFF; // the first 32bit word of the _code
        require(promiseExpirationDate[promiseId] != 0);

        uint256 fee = 0;
        if (feePercent != 0) {
            // Calculate the service fee (if specified)
            fee = _amount.mul(feePercent).div(100);

            // Increase multisignature wallet balance by the fee amount
            balances[vowmeMultisig] = balances[vowmeMultisig].add(fee);
        }

        // Decrease the author's balance
        balances[msg.sender] = balances[msg.sender].sub(_amount);

        // Decrease the initial value by the fee amount
        uint256 clearAmount = _amount.sub(fee);

        // Set the promise balance
        promiseBalance[promiseId] = clearAmount;

        // Donator's (challenger's) ID
        uint32 donatorId = uint32(_code >> 64); // the third 32bit word of the _code

        // If the donor challenges someone
        if (donatorId != 0) {
            // Update the donor's statistics
            statDonatorPromiseSum[donatorId][promiseId] =
                statDonatorPromiseSum[donatorId][promiseId].add(clearAmount);

            // Notify listeners about this event
            Initialize(msg.sender, clearAmount, promiseId, promiseExpirationDate[promiseId]);
            Donate(msg.sender, clearAmount, promiseId, donatorId);
        } else {
            Initialize(msg.sender, clearAmount, promiseId, promiseExpirationDate[promiseId]);
        }
    }

    /// @notice This function is called by the donor
    /// to transfer the specified amount of tokens to the specified promise.
    /// @param _amount The number of tokens that the donor transfers to the promise.
    /// @param _code The numeric code that contains the promise ID and the donor ID.
    /// The donor will see the _code on the promise page when he clicks the `Donate` button.
    function donate(uint256 _amount, uint256 _code) external onlyPayloadSize(2) {
        require(_amount != 0);
        require(_code != 0);

        // Promise's ID
        uint32 promiseId = uint32(_code >> 32); // the second 32bit word of the _code variable

        // Check if the promise is expired or
        // wasn't initialized by the author
        require(now <= promiseExpirationDate[promiseId]);

        // Are donations enabled for this promise?
        require(!promiseDenyDonations[promiseId]);

        uint256 fee = 0;
        if (feePercent != 0) {
            // Calculate service's fee if specified
            fee = _amount.mul(feePercent).div(100);

            // Increase multisignature wallet balance by amount of the fee
            balances[vowmeMultisig] = balances[vowmeMultisig].add(fee);
        }

        // Decrease the donor's balance
        balances[msg.sender] = balances[msg.sender].sub(_amount);

        // Reduce the initial value by amount of the fee
        uint256 clearAmount = _amount.sub(fee);

        // Increase the promise's balance
        promiseBalance[promiseId] = promiseBalance[promiseId].add(clearAmount);

        // Donator's ID
        uint32 donatorId = uint32(_code); // the first 32bit word of the _code

        // Update the donor's statistics
        statDonatorPromiseSum[donatorId][promiseId] =
            statDonatorPromiseSum[donatorId][promiseId].add(clearAmount);

        // Notify listeners about this event
        Donate(msg.sender, clearAmount, promiseId, donatorId);
    }

    /// @dev An internal function for `kept`, `failed` and `notsure`
    /// functions described below.
    function rate(uint256 _code)
        internal
        view
        returns(uint32 promiseId, uint32 donatorId)
    {
        require(_code != 0);

        // Promise's ID
        promiseId = uint32(_code >> 32); // the second 32bit word of the _code

        // Check if we are within the rate period
        require(now > promiseExpirationDate[promiseId]);
        require(now <= promiseExpirationDate[promiseId].add(ratePeriod));

        // Donator's ID
        donatorId = uint32(_code); // the first 32bit word of the _code

        // Donor can rate a promise only once
        require(donatorPromiseRate[donatorId][promiseId] == 0);

        // Donor must donate some tokens to the promise
        // before he can rate it
        require(statDonatorPromiseSum[donatorId][promiseId] != 0);
    }

    /// @notice This function is called by the donor
    /// to `like` the specified promise.
    /// @param _code The numeric code that contains promise's ID and donator's ID.
    /// The _code can be read by donator on promise's page
    /// when he presses `Kept` button.
    function kept(uint256 _code) external onlyPayloadSize(1) {
        var (promiseId, donatorId) = rate(_code);
        donatorPromiseRate[donatorId][promiseId] = 3; // kept
        Kept(msg.sender, promiseId, donatorId);
    }

    /// @notice This function should be called by donator
    /// to make a `notsure` rate for a specified promise.
    /// @param _code The numeric code that contains promise's ID and donator's ID.
    /// The _code can be read by donator on promise's page
    /// when he presses `Not sure` button.
    function notsure(uint256 _code) external onlyPayloadSize(1) {
        var (promiseId, donatorId) = rate(_code);
        donatorPromiseRate[donatorId][promiseId] = 2; // not sure
        Notsure(msg.sender, promiseId, donatorId);
    }

    /// @notice This function should be called by donator
    /// to make a `dislike` rate for a specified promise.
    /// @param _code The numeric code that contains promise's ID and donator's ID.
    /// The _code can be read by donator on promise's page
    /// when he presses `Failed` button.
    function failed(uint256 _code) external onlyPayloadSize(1) {
        var (promiseId, donatorId) = rate(_code);
        donatorPromiseRate[donatorId][promiseId] = 1; // failed
        Failed(msg.sender, promiseId, donatorId);
    }

    /// @notice Move the promise's tokens to `_target` address.
    /// The _target can be the promiser's (author's) or a charity's address.
    /// This function may be called only by the owner.
    /// @param _code The special number that stores the promise's ID
    /// and other necessary info.
    /// @param _amount The number of tokens to be moved.
    /// @param _target The address which will receive tokens.
    function move(uint256 _code, uint256 _amount, address _target)
        external
        onlyPayloadSize(3)
        onlyOwner
    {
        // Promise's ID
        uint32 promiseId = uint32(_code); // the first 32bit word of the _code

        require(promiseExpirationDate[promiseId] != 0); // make sure the promise is initialized
        require(now > promiseExpirationDate[promiseId]); // the expiration date must be in the past

        // Should we deny donations for this promise?
        bool denyDonations = ((_code >> 32) & 1) != 0;

        if (denyDonations) {
            promiseDenyDonations[promiseId] = true;
        }

        // Decrease the promise's balance
        promiseBalance[promiseId] = promiseBalance[promiseId].sub(_amount);

        // Increase the target's balance
        balances[_target] = balances[_target].add(_amount);

        // Notify listeners about this event
        Move(promiseId, _target, _amount);
    }

    /// @notice This function is called by the owner when
    /// a proof is loaded by the author of the promise.
    /// @param _code The numeric code that stores the ID of the promise
    /// and it's new expiration date (as a unix timestamp).
    function proofLoaded(uint256 _code)
        external
        onlyPayloadSize(1)
        onlyOwner
    {
        uint32 promiseId = uint32(_code >> 32); // promise's ID (the second 32bit word of the _code)

        require(promiseExpirationDate[promiseId] != 0); // make sure the promise is initialized

        // Update the promise's expiration date (as a unix timestamp)
        promiseExpirationDate[promiseId] = _code & 0xFFFFFFFF; // the first 32bit word of the _code

        // Disable donations to this promise
        promiseDenyDonations[promiseId] = true;

        // Notify listeners about this event
        ProofLoaded(promiseId, promiseExpirationDate[promiseId]);
    }

    /// @notice This function can be called by anyone
    /// who doesn't have any tokens. For example,
    /// it can be any user who wants to create his promise
    /// but doesn't have tokens to do so. A caller can
    /// make this token request only once. We gift them 0.01 VME.
    /// The max number of calls for this function is limited and
    /// defined in `vmeGiftLimit` variable.
    function getFree() external {
        require(promisesAllowed); // promises functions must be allowed
        require(balances[msg.sender] == 0); // balance of the caller must be empty
        require(!freeRequested[msg.sender]); // this is the first time for msg.sender
        require(vmeGiftTotal < vmeGiftLimit); // limit the number of calls to this function

        uint256 vmeGift = 10**16; // 0,01 VME

        balances[vowmeMultisig] = balances[vowmeMultisig].sub(vmeGift);
        balances[msg.sender] = vmeGift;
        freeRequested[msg.sender] = true;
        vmeGiftTotal = vmeGiftTotal.add(1);

        // Notify listeners about this event
        GetFree(msg.sender);
        Transfer(vowmeMultisig, msg.sender, vmeGift);
    }

    /// @dev Set new rate period.
    /// This function may be called only be the owner.
    /// @param _period The rate period in seconds.
    function setRatePeriod(uint256 _period) external onlyOwner {
        ratePeriod = _period;
    }

    /// @dev Set the fee percentage if neccessary.
    /// This function can be called only be the owner.
    /// @param _percent The fee percentage.
    function setFeePercent(uint256 _percent) external onlyOwner {
        feePercent = _percent;
    }

    /// @dev Set new call limit for `getFree` function.
    /// This function can be called only be the owner.
    /// @param _limit The new max number of calls.
    function setGiftLimit(uint256 _limit) external onlyOwner {
        vmeGiftLimit = _limit;
    }
    
}