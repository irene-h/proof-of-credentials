var Credentials = artifacts.require("./Credentials.sol");

module.exports = function (deployer) {
  deployer.deploy(Credentials);
};
