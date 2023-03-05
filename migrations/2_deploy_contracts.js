const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    let firstAirline = '0x7bEaaF4C2fEE180021e7A8C4A22616Bb938c8b1C';
    deployer.deploy(FlightSuretyData)
    .then(() => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:7545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address,
                            ownerAddress: '0x51f9378B809cb9485dF83beEEECF20b23792F161',
                            startingAirlines: [
                                {name: "Owner Airline", address: '0x51f9378B809cb9485dF83beEEECF20b23792F161'}, //accounts[0]
                                {name: "First Airline", address: '0xe2B1b777259a815bbee83030263402cd5cD15528'}, //accounts[1]
                                {name: "Second Airline", address: '0x28DF7Ee41CbA72dF2E2972fBA63487ADF32412C0'}, //accounts[2]
                                {name: "Third Airline", address: '0xc4F3F8EEb275Aa6558Eb5f0BD94059c82FE221f5'} //accounts[3]
                            ],
                            startingFlights: [
                                {name: "AL123", from: "FRA", to: "LHR"},
                                {name: "AL456", from: "FRA", to: "JFK"},
                                {name: "AL789", from: "FRA", to: "SYD"}
                                 
                            ],
                            oracleAddresses:['0xA2CAd9a05fe8B6942d7aCE68D7a72176a0e6838A',
                                            '0x6391ad5ff11aB19fABdB9BB530c287e4a0e0E66E',
                                            '0xbcA025101952eAA6fa6831dE704c59DC4535a744',
                                            '0x62cBE04f5a048a9D009b6377A3f9Ad15E6AfB77c',
                                            '0x1DBe89C8d92A989E4B6ecF9a93dF6f3ddDBDdC7f',
                                            '0xa88E96d08FA8D9b845998f554830404DD2B23197',
                                            '0xA063084879E5d19e7654fFB03c6eB9273f65196B',
                                            '0xd73B35f18e630fC6F7406A1310611c47c1b653d4',
                                            '0x1BaE2E8A3215a6F42c62E7Df5692da1717Ba9f1D',
                                            '0x017BC042cd705F0845Df4aaa34950f342e280d58',
                                            '0x2F6E72494beDF510c3d8e4f472740Bfe9199A399',
                                            '0x2EA817488E5F8c54b315d9bBBcDB60ae96D9960d',
                                            '0x4984475420E55A53005D70caB4496088C07984a2',
                                            '0x18aC4AC282A23f0f9d6a739DE6FF543d3ebce8F0',
                                            '0xD86Ad1894366cB96A7B62e05B66724A9Be5fA306',
                                            '0x9f7d5215159313f9BAF49b69F6258886ad17DBc6',
                                            '0x2D95318372C88506087FE5c21474B9791292061a',
                                            '0xcE83Bc7096C72CD9facE0F48B8b017de0801380f',
                                            '0x5491aCD25A89d9C3229016eD0bc14A05aD4a7875',
                                            '0x62F56B8801b288F83CA16F7BD34cb1d3E480981b',
                                            '0x89fB0dD60B822b0CA2A229cEfB4E651E3bc9Ab0f']
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}