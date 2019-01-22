# Identity credentials dApp

## About this dApp 

This dApp allows citizens to create identity credentials out of a document scan and request their validation to an Authority. This dApp also implements the Authority role by enabling the validation and revokation of credentials. 

Read more below.


## Installation

1. Create a folder for this project

2. Go to the console and clone the github repository
    ```javascript
    git copy 
    ```

3. Install the necessary dependencies listed in pagacke.json
    ```javascript
    npm install
    ```
4. Run a local ethereum node with ganache
    ```javascript
    ganache-cli
    ```
5. Copy the seed phrase and connect these accounts with Metamask
    Select localhost 8545 network
    Restore account from seed phrase
    Paste the seed phrase from the ganache-cli console

4. Navigate to the src/ethereum folder and migrate the contract to the development network
    ```javascript
    cd /src/ethereum
    truffle migrate --reset --network development
    ```
5. Run the development server 
    ```javascript
    // Serves the front-end on http://localhost:3000
    npm run start
    ```

## Intearcting with the contract

The typical application flow of this dApp is as follows:

1. Citizen uploads an ID document scan to IPFS
2. IPFS returns an ipfsHash
3. Citizen sends ipfsHash to smart contract and requests a new credential
4. Smart contract creates a new credential, stores it in the blockchain and returns a reference number
5. Authority checks status of newly created credentials by passing the reference number (status should be 'Pending') 
6. Authority validates credential
7. Authority may revoke a previously validated credential
8. Citizens and Authority may check credential status at any time by passing the reference number.

The contract and UI has been prepared in such a way that anyone can represent both the authority and a citizen using different Metamask accounts for each role. This setup enables the follow up of a credential throughout its entire lifecycle (created by a citizen, validated by an Authority, revoked by an Authority). 

The UI shows simultaneously in two different sections the Citizens' view and the Authority's view. You may create credentials as a Citizen and validate/revoke them as an Authority.

**NOTE**: Credentials cannot be validated by Citizens (that is, you should use one Metamask account for the citizen role and change to another Metamask for the Authority role)

More details are shown in the dApp Flow below: 
![alt text](https://github.com/irene-h/proof-of-credentials/blob/master/Credentials.png "Identity credentials flow")

