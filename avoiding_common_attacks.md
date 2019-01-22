# Avoiding common attacks

This contract has been designed to avoid common attacks

## Reentrancy
As this contract is not executing calls/transfers, reentrancy is not an issue

## Modifying the same state
This contract has several functions that modifies the Registry state. The problems that could arise are mitigated setting modifiers to each function, such as two functions cannot modify the same Registry key/value pair. For instance, function revokeCredential can only be executed if credential has been validated first (that is, credential status is 'Valid'). This ensures the issueCredential and revokeCredential functions are not called at the same time for a specific Registry key/value pair

## Timestamp Dependence
The separation of roles (Citizen and Authority) makes the timestamp dependence a negligible risk

## Integer Overflow and Underflow
Reference numbers are created inside the contract. To avoid integer overflow, the library SafeMath has been imported and used in the generation of reference numbers

## DoS with (Unexpected) revert
This contract is not passing execution to another contract, so denial of service attack is not an issue

## Forcibly Sending Ether to a Contract
This contract is not using logic that depends on the contract balance, so forcibly sending ether to a contract is not an issue