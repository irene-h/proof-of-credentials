This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


# IDENTITY CREDENTIALS dApp

## About

This dApp allows citizens to create identity credentials out of a document scan and request their validation to an authority. Document scans are uploaded into IPFS, the dApp returns then a credential reference number that will unequivocally identify that credential and sets its status to 'Pending'. Authorities can then check the status of a credential by its reference number, check offline the associated IPFS document, and validate the credential. Authorities can also revoke previously validated credentials. 
Anyone can be an authority or a citizen so that you may follow the entire lifecycle of a credential (created by a citizen, validated by an Authority, revoked by an Authority). To facilitate interaction with the contract, the UI has been designed with two panels: the Citizens view and the Authority view. You may create credentials as a Citizen and validate/revoke them as an Authority.
**NOTE**: Credentials cannot be validated by Citizens (that is, you should use one Metamask account for the citizen role and change to another Metamask for the Authority role)

## Installation

1. Create a folder for this project

2. Go to the console and clone the github repository
    ```javascript
    git copy 
    ```

3. Install the necessary dependencies
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

## Credentials flow

Please see below a typical credential flow for a better understanding of the dApp functionality:
Identity Credentials Flow: 
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Identity credentials flow")


## FAQ

* __How do I use this with the EthereumJS TestRPC?__

    It's as easy as modifying the config file! [Check out our documentation on adding network configurations](http://truffleframework.com/docs/advanced/configuration#networks). Depending on the port you're using, you'll also need to update line 16 of `src/js/app.js`.

