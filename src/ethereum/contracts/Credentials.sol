pragma solidity ^0.5.0;

import "./../../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Credentials is Ownable {

    //if stopped is true, emergency status is active
    bool private stopped = false;
    uint public ref;
    using SafeMath for uint;

    //Registry of credentials
    mapping (uint => Credential) internal Registry;


    // Possible states of a credential: Pending, Valid and Revoked 
    enum Status {Pending, Valid, Revoked} 

    // Credential structure 
    struct Credential {
        uint ref;
        string ipfsHash;
        Status status;
        address issuer;
        address holder;
    } 
 
    // Create events with the same name as each possible State 
    event setEmergencyStatus(bool stopped);
    event setPending(uint ref, string indexed ipfsHash, uint status, address indexed issuer, address indexed holder);
    event setValid(uint ref, string indexed ipfsHash, uint status, address indexed issuer, address indexed holder);
    event setRevoked(uint ref, string indexed ipfsHash, uint status, address indexed issuer, address indexed holder);
    event fetchCredential (uint ref, string indexed ipfsHash, uint status, address indexed issuer, address indexed holder);

    
    // CIRCUIT BREAKER - Blocks functions in case of emergency (e.g. a serious bug is found in contract) 
    modifier stopInEmergency {
        if (!stopped) _;
        else revert("Emergency status");
    }

    // modifer that ensures the msg.sender is allowed to execute the function 
    modifier isAllowed (address _address) { 
        require (msg.sender == _address, "Account is not authorized"); 
        _;
    }

    // modifer that ensures if the msg.sender is not allowed to execute the function   
    modifier notAllowed (address _address) {
        require (msg.sender != _address, "Account is not authorized"); 
        _;
    }

    // modifier that requires that the credential with the given ref has the given state. 
    modifier isPending (uint _ref) {
        require(Registry[_ref].status == Status.Pending,"Credential has been validated");
        _;
    }
    modifier isValid (uint _ref) {
        require(Registry[_ref].status == Status.Valid,"Credential is not valid");
        _;
    }
    modifier isRevoked (uint _ref) {
        require(Registry[_ref].status == Status.Revoked,"Credential is not revoked");
        _;
    }
    
    constructor() public {
    }

    
    // Changes emergency status of contract 
    function toggleContractActiveStatus() public onlyOwner {
        stopped = !stopped;
        emit setEmergencyStatus(stopped);
    }

    // Creates a new credential 
    function createCredential(string memory _ipfsHash) public stopInEmergency returns (uint) {
        ref = ref.add(1);
        Registry[ref] = Credential({ref: ref, ipfsHash: _ipfsHash, status: Status.Pending, issuer: address(0), holder: msg.sender});
        emit setPending(ref, Registry[ref].ipfsHash, uint(Registry[ref].status), Registry[ref].issuer, Registry[ref].holder);
        return ref;
    }

    // Validates a newly created credential - Credentials cannot be validated by credential creator (holder)
    function issueCredential(uint _ref) public notAllowed(Registry[_ref].holder) isPending(_ref) stopInEmergency {
        Registry[_ref].issuer = msg.sender;
        Registry[_ref].status = Status.Valid;
        emit setValid(_ref, Registry[_ref].ipfsHash, uint(Registry[_ref].status), Registry[_ref].issuer, Registry[_ref].holder);
    }

    // Revokes a previously validated credential. It can only be performed by the credential validator (issuer) 
    function revokeCredential(uint _ref) public isAllowed(Registry[_ref].issuer) isValid(_ref) stopInEmergency {
        Registry[_ref].status = Status.Revoked;
        emit setRevoked(_ref, Registry[_ref].ipfsHash, uint(Registry[_ref].status), Registry[_ref].issuer, Registry[_ref].holder);
    }
 
    // Anyone can verify the existence, status and issuer of a specific credential. If credential does not exist, function reverts. 
    function checkCredential(uint _ref) public returns (uint, string memory ipfsHash, uint status, address issuer, address holder) {
        emit fetchCredential(_ref, Registry[_ref].ipfsHash, uint(Registry[_ref].status), Registry[_ref].issuer, Registry[_ref].holder);
        ipfsHash = Registry[_ref].ipfsHash;
        status = uint(Registry[_ref].status);
        issuer = Registry[_ref].issuer;
        holder = Registry[_ref].holder;
        return (_ref, ipfsHash, status, issuer, holder);
    }

}