
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'wood wolf wrestle neutral pledge flash warm chest fresh empty unlock slender';
var infura = 'https://rinkeby.infura.io/v3/206f04d86d424e19a81b0f3c8ffc845b'

module.exports = {

    networks: {
        development:{
            host: "127.0.0.1",
            port: 8545,
            network_id: "*"
        }, 
        rinkeby: {
            provider: new HDWalletProvider(
            mnemonic,infura
            ),
            network_id: 4,
            gas: 4500000,
        },
    }
}
