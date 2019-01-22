import React, { Component } from 'react';
import ipfs from './utils/ipfs';
import getWeb3 from './utils/getWeb3';
import CredentialsContract from './ethereum/build/contracts/Credentials.json';
import {Grid, Form, Button, Table } from 'react-bootstrap';

// Styles
import './css/App.css';



class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            accounts: null,
            buffer:'',
            contract: null,
            contractAddress: '',
            blockNumber:'',
            transactionHash:'',
            gasUsed:'',
            txReceipt: '',   
            ref: '',
            ipfsHash: '',
            status: '',
            issuer: null,
            holder:null,
            view: '',
            
        };
    };

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
      
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
      
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = CredentialsContract.networks[networkId];
            const contractAddress = deployedNetwork && deployedNetwork.address;
            const CredentialsInstance = new web3.eth.Contract(
                CredentialsContract.abi,
              contractAddress,
            );
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({web3, accounts, contract: CredentialsInstance, contractAddress});

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.log(error);
        }
    };

    captureRef = (event)  => {
        this.setState({ref: event.target.value});
    };
    

    captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => {
            //file is converted to a buffer to prepare for uploading to IPFS
            const buffer = Buffer.from(reader.result);
            //set this buffer -using es6 syntax
            this.setState({buffer});
        };  
    };

    onCreate = async (event) => {
        event.preventDefault();
        //save document to IPFS,return its hash#, and set hash# to state
        const web3 = this.state.web3;
        const accounts = await web3.eth.getAccounts();  
        this.setState({accounts, ref: "wait...", ipfsHash: "wait...", holder: null, issuer: null, status: "wait...", transactionHash: "wait..."});
        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err,ipfsHash);
            //call Contracts contract method "createCredential" and .send IPFS hash to ethereum contract 
            //return the transaction hash from the ethereum contract and the credential reference number            
            const contract = this.state.contract;
            contract.methods.createCredential(this.state.ipfsHash).send({
                from:  accounts[0]
            }, (err, transactionHash) => {
                contract.events.setPending(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Document has been assigned reference # " + result.returnValues.ref
                    + ". Its status is " + result.returnValues.status
                    );
                    if (result.returnValues.status === '0') {this.setState({status:"Pending"})}
                    if (result.returnValues.issuer === '0x0000000000000000000000000000000000000000') {this.setState({issuer:"Pending"})}
                    this.setState({ref: result.returnValues.ref, ipfsHash: result.returnValues.ipfsHash, holder:result.returnValues.holder});
                }.bind(this));;
                this.setState({transactionHash}); 
            }); //storehash 
        }) //await ipfs.add 
    };


    onCheck= async (event) => {
        event.preventDefault();
        const web3 = this.state.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({accounts, ipfsHash: "wait...", holder: null, issuer: null, status: "wait...", transactionHash: "wait..."});
        const contract = this.state.contract;
        contract.methods.checkCredential(this.state.ref).send({from:  accounts[0]}, (err, transactionHash) => {
            contract.events.fetchCredential(function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log("Document with ref # " + result.returnValues.ref
                + " from owner " + result.returnValues.holder 
                + " has status " + result.returnValues.status
                + " and was issued by " + result.returnValues.issuer
                );
                if (result.returnValues.holder === '0x0000000000000000000000000000000000000000') {this.setState({ipfsHash:"", holder:"Credential reference does not exist yet"})}
                else {this.setState({ipfsHash: result.returnValues.ipfsHash, holder:result.returnValues.holder})}
                if (result.returnValues.status === '0') {this.setState({status:"Pending"})}
                else if (result.returnValues.status === '1') {this.setState({status:"Validated"})}
                else if (result.returnValues.status === '2') {this.setState({status:"Revoked"})}
                if (result.returnValues.issuer === '0x0000000000000000000000000000000000000000') {this.setState({issuer:"Pending"})}
                else {this.setState({issuer:result.returnValues.issuer})}
                this.setState({ref: result.returnValues.ref});
            }.bind(this));
        this.setState({transactionHash}); 
        });    
    }; //onCheck



    onIssue = async (event) => {
        event.preventDefault();
        try{
            const web3 = this.state.web3;
            const accounts = await web3.eth.getAccounts();
            this.setState({accounts, ipfsHash: "wait...", holder: null, issuer: null, status: "wait...", transactionHash: "wait..."});
            const { contract } = this.state;
            contract.methods.issueCredential(this.state.ref).send({
                from:  accounts[0]
            }, (err, transactionHash) => {
                this.setState({transactionHash});
                contract.events.setValid(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Status of Document with ref # " + result.returnValues.ref
                    + " has been set to " + result.returnValues.status
                    );
                    if (result.returnValues.status === '1') {this.setState({status:"Validated"})}
                    this.setState({ref: result.returnValues.ref, ipfsHash: result.returnValues.ipfsHash, issuer: result.returnValues.issuer, holder:result.returnValues.holder});
                }.bind(this));
                this.setState({transactionHash }); 
            }); //issueCredential 
        } //try
        catch(error){
            console.log(error);
        } //catch
    }; //onIssue  


    onRevoke= async (event) => {
        event.preventDefault();
        try{
            const web3 = this.state.web3;
            const accounts = await web3.eth.getAccounts();
            this.setState({accounts, ipfsHash: "wait...", holder: null, issuer: null, status: "wait...", transactionHash: "wait..."});
            const { contract } = this.state;
            contract.methods.revokeCredential(this.state.ref).send({
                from:  accounts[0]
            }, (err, transactionHash) => {
                console.log(transactionHash);
                this.setState({transactionHash});
                contract.events.setRevoked(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Status of Document with ref # " + result.returnValues.ref
                    + " has been set to " + result.returnValues.status
                    );
                    if (result.returnValues.status === '2') {this.setState({status:"Revoked"})}
                    this.setState({ref: result.returnValues.ref, ipfsHash: result.returnValues.ipfsHash, issuer: result.returnValues.issuer, holder:result.returnValues.holder})
                }.bind(this));
                this.setState({transactionHash }); 
            }); //issueCredential  
        } //try
        catch(error){
            console.log(error);
        } //catch
    }; //onClick


    render() {
        return (
            <div>
                <header className="App-header">
                    <h1> Registry of identity credentials</h1>
                </header>

                <Grid>
                    <h2> Citizen Portal - Create Identity Credentials </h2>
                    <h3> Choose file to upload to IPFS </h3>
                
                        <Form onSubmit={this.onCreate}>
                        <input 
                            type = "file"
                            onChange = {this.captureFile}
                        />
                            <Button 
                                bsStyle="primary" 
                                type="submit"> 
                                Request credential validation 
                            </Button>
                        </Form>
                
                        <p>Credential reference number: {this.state.ref} </p>
                   
                    <hr/>
                    
                    {/* CHECK STATUS BUTTON */}                  
                    <h3> Insert credential reference number to check its status</h3>
                    <Form onSubmit={this.onCheck}>
                    <input 
                        type = "text"
                        onChange={this.captureRef}
                    />
                        <Button 
                            bsStyle="primary" 
                            type="submit">
                            Check status 
                        </Button>
                    </Form>

                    {/* RESULTS TABLE */}
                    <Table bordered responsive>
                    <thead>
                        <tr>
                        <th>Tx Receipt Category</th>
                        <th>Values</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                    <tr>
                        <td>Credential reference #</td>
                        <td>{this.state.ref}</td>
                        </tr>

                        <tr>
                        <td>IPFS Hash #</td>
                        <td>{this.state.ipfsHash}</td>
                        </tr>

                        <tr>
                        <td>Credential owner</td>
                        <td>{this.state.holder}</td>
                        </tr>           

                        <tr>
                        <td>Credential issuer</td>
                        <td>{this.state.issuer}</td>
                        </tr> 

                        <tr>
                        <td>Credential status</td>
                        <td>{this.state.status}</td>
                        </tr> 

            
                    </tbody>
                </Table>

                <hr/>
                <hr/>
                
                <h2> Authority Portal - Validate Identity Credentials </h2>
                    <h3> Insert Credential reference number. Please note that you cannot validate your own Credentials</h3>              

                    <Form onSubmit={this.onCheck}>
                        <input 
                            type = "text"
                            onChange={this.captureRef}
                        />
                            <Button 
                                bsStyle="primary" 
                                type="submit">
                                Check status 
                            </Button>
                        </Form>

                        <p>Insert credential reference number </p>
                        <Form onSubmit={this.onIssue}>
                        <input 
                            type = "text"
                            onChange={this.captureRef}
                        />
                            <Button 
                                bsStyle="primary" 
                                type="submit">
                                Validate credential 
                            </Button>
                        </Form>

                        <p>Insert credential reference number </p>
                        <Form onSubmit={this.onRevoke}>
                        <input 
                            type = "text"
                            onChange={this.captureRef}
                        />
                            <Button 
                                bsStyle="primary" 
                                type="submit">
                                Revoke credential 
                            </Button>
                        </Form>
                    
                    
                    <Table bordered responsive>
                    <thead>
                        <tr>
                        <th>Tx Receipt Category</th>
                        <th>Values</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                    <tr>
                        <td>Credential reference #</td>
                        <td>{this.state.ref}</td>
                        </tr>

                        <tr>
                        <td>IPFS Hash #</td>
                        <td>{this.state.ipfsHash}</td>
                        </tr>

                        <tr>
                        <td>Credential owner</td>
                        <td>{this.state.holder}</td>
                        </tr>           

                        <tr>
                        <td>Credential issuer</td>
                        <td>{this.state.issuer}</td>
                        </tr> 

                        <tr>
                        <td>Credential status</td>
                        <td>{this.state.status}</td>
                        </tr> 
            
                    </tbody>
                </Table>
                </Grid>
            </div>
        ); 
    }
}

export default App;

