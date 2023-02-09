
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x265E2842AF1e6590B7d877B3c148268e04a7daA4",
        "0x946613Bb18DB8F5162d8794652C215245D6d7B9C",
        "0x084FD6d841D6eAC506f33248DC009DA16388e77E",
        "0xFA2cCC7469F18b615439d20B7F67adc8ecc1Dbd8",
        "0x4915314ae4dB8d5d7a3c5Bef6b1868a1CFd5f7Af",
        "0xf74Dd53fe51B565499de2ef100f2E0aef4BDc64c",
        "0x6105f26A6140114ed920DBC267cfD406E5B0Ab35",
        "0x8e54d2D7FD242DBEC5c13A7D5C8cD297f797BB4E",
        "0x6B43D2D74379a43E110E74c269A99600A18Ac290",
        "0xa19a639A46F7AbfE2bBA4196FE30Fb80acaF6C4b"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};