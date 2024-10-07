const OTPAuthentication = artifacts.require("OTPAuthentication");

module.exports = function(deployer) {
    deployer.deploy(OTPAuthentication);
};