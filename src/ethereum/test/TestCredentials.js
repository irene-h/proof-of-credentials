const truffleAssert = require('truffle-assertions');
var Credentials = artifacts.require('Credentials')

contract('Credentials', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'
    const ipfsHashforTesting = '0xe166801d00a45901e2b3ca692a6a95e367d4a976218b485546a2da464b6c88b5';

    var ref

   
//CREATING NEW CREDENTIALS

    /* tests that new credentials are correctly created; that is, reference is assigned, status is set to Pending, 
    owner is set to msg.sender and issuer has not been assigned */
    it("should correctly create new Credentials", async() => {
        const credentials = await Credentials.deployed()
        var eventEmitted = false
        const expectedStatus = 0;
        const tx = await credentials.createCredential(ipfsHashforTesting, {from: alice})
	    if (tx.logs[0].event === "setPending") {
            ref = tx.logs[0].args.ref
            eventEmitted = true
	    }
        const result = await credentials.checkCredential.call(ref)

        assert.equal(result[1], ipfsHashforTesting, 'the ipfsHash stored is not the one provided')
        assert.equal(result[2], expectedStatus, 'credential status should be Pending')
        assert.equal(result[3], emptyAddress, 'Issuer should be empty')
        assert.equal(result[4], alice, 'credential holder is not credential requestor')
        assert.equal(eventEmitted, true, 'creating a credential should emit a SetPending event')
    })

//VALIDATING CREDENTIALS

    /* tests that new credentials are correctly validated; that is, status is set to Valid, 
    issuer is set to msg.sender, and remaining credentials values are preserved. */
    it("should correctly validate newly created credentials", async() => {
        const credentials = await Credentials.deployed()
        var eventEmitted = false
        const expectedStatus = 1;
        const tx = await credentials.createCredential(ipfsHashforTesting, {from: alice})
        ref = tx.logs[0].args.ref
    
        const tx2 = await credentials.issueCredential(ref, {from: bob})
        if (tx2.logs[0].event === "setValid") {
            eventEmitted = true
        }
        const result = await credentials.checkCredential.call(ref, {from: bob})

        assert.equal(result[1], ipfsHashforTesting, 'the ipfsHash stored is not the one provided')
        assert.equal(result[2], expectedStatus, 'credential status should be Valid')
        assert.equal(result[3], bob, 'issuer should be bob')
        assert.equal(result[4], alice, 'credential holder should be alice')
        assert.equal(eventEmitted, true, 'issuing a credential should emit a setValid event')
    })

    //tests that credentials cannot be validated by credential holder
    it("should not allow validate credentials by credential holder'", async() => {
        const credentials = await Credentials.deployed()
        const tx = await credentials.createCredential(ipfsHashforTesting, {from: alice})
        ref = tx.logs[0].args.ref
        await truffleAssert.fails(credentials.issueCredential(ref, {from: alice}))
        })


//REVOKING CREDENTIALS


    /* tests that new credentials are correctly validated; that is, status is set to Revoked, 
    and remaining credentials values are preserved.   */
    it("should correctly revoke valid credentials", async() => {
        const credentials = await Credentials.deployed()
        var eventEmitted = false
        const expectedStatus = 2;
        const tx = await credentials.createCredential(ipfsHashforTesting, {from: alice})
        ref = tx.logs[0].args.ref
        await credentials.issueCredential(ref, {from: bob})

        const tx2 = await credentials.revokeCredential(ref, {from: bob})
        if (tx2.logs[0].event === "setRevoked") {
            eventEmitted = true
        }
        const result = await credentials.checkCredential.call(ref, {from: bob})

        assert.equal(result[1], ipfsHashforTesting, 'the ipfsHash stored is not the one provided')
        assert.equal(result[2], expectedStatus, 'credential status should be Revoked')
        assert.equal(result[3], bob, 'issuer should be bob')
        assert.equal(result[4], alice, 'credential holder should be alice')
        assert.equal(eventEmitted, true, 'revoking a credential should emit a setRevoked event')
    })

    //tests that credentials cannot be revoked if their status is Pending
    it("should not allow validate credentials if status is 'Pending'", async() => {
        const credentials = await Credentials.deployed()
        const tx = await credentials.createCredential(ipfsHashforTesting, {from: alice})
        ref = tx.logs[0].args.ref
        await truffleAssert.fails(credentials.revokeCredential(ref, {from: alice}))
        })
    


// EMERGENCY STATUS

    //tests that credentials cannot be created in emergency status  
    it("should only allow check existing credentials in Emergency status'", async() => {
        const credentials = await Credentials.deployed()
        await credentials.toggleContractActiveStatus({from: owner})
        await truffleAssert.reverts(credentials.createCredential(ipfsHashforTesting, {from: alice}))
        })
});

