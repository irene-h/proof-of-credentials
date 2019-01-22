# Design pattern decisions

## Behavioral Patterns
### **State Machine:** Enable a contract to go through different stages with different corresponding functionality exposed.
Different functions should be able to modify the Registry of credentials (updating their status/owners). Because this could imply conflicting state changes, designing the contract with certain stages in which different functions could be called was considered at the beginning. The state machine model cannot be implemented at contract level, as each credential needs to manage its own stage and allowed functions. For this reason, the contract implements a modifier for each credential stage (or status) and functions can be called depending on the credential status.

### **Oracle:** Gain access to data stored outside of the blockchain.
The contract could be modified by enabling an Oracle that provides the credential reference numbers (e.g. a government setting up an Oracle to provide these references). This design pattern has not been implemented in this contract due to the lack of access to this type of Oracles.


### **Randomness:** Generate a random number of a predefined interval in the deterministic environment of a blockchain.
The contract could also assign a random number to the credential reference. This design pattern was evaluated to further ensure Citizen's privacy, but did not provide any real advantage to setting a serialized sequence of integers. 

## Security Patterns

### **Emergency Stop:** Add an option to disable critical contract functionality in case of an emergency.
A circuit breaker has been implemented to avoid the creation, validation and revokation of credentials in case a bug in the contract is discovered.

### **Access Restriction:** Restrict the access to contract functionality according to suitable criteria.
Restricting access is a common pattern for contracts. The contract was designed such as anyone can represent the role of an Authority or a Citizen, but Citizens cannot validate/revoke their own credentials. This should be changed in a production environment and enable a whitelist of allowed Authorities.

On the other hand, the Contract owner is the only entity that can declare the status of emergency - in which case the CheckCredential function is the only one enabled.

