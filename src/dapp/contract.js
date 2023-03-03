import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor() {

    }

    async initialize(network) {
        let config = Config[network];
        this.owner = config.ownerAddress;
        this.appAddress = config.appAddress; // handover required as I will call authorizeCaller directly from index.js
        this.oracleAddresses = config.oracleAddresses;
        await this.initializeWeb3(config);
        await this.initializeContracts(config);

        //let accts = await this.web3.eth.getAccounts();
        //console.log(accts);

        this.airlines = config.startingAirlines;
        this.passengers = config.startingPassengers;
        this.flights = config.startingFlights;

        console.log('here?')
        //Authorise app contract to call data contract
        //await this.authorizeCaller(config.appAddress);

        //Register  - but not fund - the 2nd, 3rd and 4th airline - owner is already the first airline
        //await this.initilizeAirlines();

        await this.updateContractInfo();

        var selectAirlines = document.getElementById("airlines-airline-dropdown");
        for(let counter=0; counter<=3; counter++) {
            selectAirlines.options[selectAirlines.options.length] = new Option(this.airlines[counter].name+"("+this.airlines[counter].address.slice(0,8)+"...)", counter);
        }

        var selectFlights = document.getElementById("flights-flights-dropdown");
        for(let counter=0; counter<=2; counter++) {
            selectFlights.options[selectFlights.options.length] = new Option(this.flights[counter].name+"("+this.flights[counter].from+" --> "+this.flights[counter].to+")", counter);
        }
    }

    async initializeWeb3(config) {
        let web3Provider;
        if (window.ethereum) {
            web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access")
            }
        } else if (window.web3) {
            web3Provider = window.web3.currentProvider;
        } else {
            web3Provider = new Web3.providers.HttpProvider(config.url);
        }
        this.web3 = new Web3(web3Provider);
        console.log(this.owner);
        this.web3.eth.defaultAccount = this.owner;
    }

    async initializeContracts(config) {
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
    }

    async initilizeAirlines() {
        let self = this;
        for (let counter=1; counter<=3; counter++) { //I do count the owner as airline, so only for other airlines are able to register without voting
        //console.log('Starting to register: '+self.airlines[counter].address+ ' by ' + self.owner);
        await self.registerAirline(self.airlines[counter].address, self.airlines[counter].name, { from: self.owner}); 
        console.log('registered: '+self.airlines[counter].address);
        }
    }

    async registerMultipleOracles(registrationFee) {
        let self = this;
        var success = true;
        console.log(registrationFee, self.oracleAddresses);
        let regFeeWei = this.web3.utils.toWei(registrationFee, 'ether');
        try {
            self.flightSuretyApp.methods
            .registerMultipleOracles(self.oracleAddresses)
            .send({ value: regFeeWei, from: self.owner });
        } catch(error){
                    console.log(error);
                    success = false;
        };
        if (success) {console.log('Oracles authorized: '+self.oracleAddresses+' by '+self.owner);};
    }

    async getDataContractAddress() {
        return this.flightSuretyData._address;
    }

    async getAppContractAddress() {
        return this.flightSuretyApp._address;
    }

    async authorizeCaller(){
        let self = this;
        var success = true;
        try {
            self.flightSuretyData.methods
            .authorizeCaller(self.appAddress)
            .send({ from: self.owner });
        } catch(error){
                    console.log(error);
                    success = false;
        };
        if (success) {console.log('App contract authorized to call data contract: '+self.appAddress+' by '+self.owner);};
    }

    async updateContractInfo() {
        let self=this;
        var statusDataContract=false; 
        try {
            statusDataContract = await self.flightSuretyData.methods.isOperational().call({ from: self.owner });
            console.log(statusDataContract);
        } catch(error){
            console.error(error);
        };
        if (statusDataContract) {
            document.getElementById('contract-operational-status').value="Operational";
        } else {
            document.getElementById('contract-operational-status').value="WARNING: Not operational";
        }


    }
    async getAirlineInfo(index) {
        let self = this;
        console.log(index, self.airlines[index].address, self.airlines[index].name)
        return [self.airlines[index].address, self.airlines[index].name];
    }
    async getFlightInfo(index) {
        let self = this;
        console.log(index, self.flights[index].name)
        return [self.flights[index].name];
    }

    
    async registerAirline(address, name) {
        let self = this;
        try {
        await self.flightSuretyApp.methods.registerAirlineApp(address,name).send({ from: self.owner });
        } catch(error){
            console.error(error);
        };
    }

    async fundAirline(address, amountEther) {
        let self = this;
        let account = await this.getAccount();
        let amountWei = this.web3.utils.toWei(amountEther, 'ether');
        //console.log(account+amountWei);
        try {
        await self.flightSuretyApp.methods.fundAirlineApp(address).send({ from: account, value: amountWei });
        } catch(error){
            console.error(error);
        };
    }

    fetchFlightStatus(flight) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    async getAccount() {
        try {
            let accounts = await this.web3.eth.getAccounts();
            return accounts[0];
        } catch (error) {
            console.log(error);
        }
    }

    // async isDataContractOperational() {
    //    let account = await this.getCurrentAccount();
    //    return await this.flightSuretyData.methods.isOperational().call({ from: account});
    // }

    // async isAppContractOperational(callback) {
    //     let account = await this.getCurrentAccount();
    //     return await this.flightSuretyApp.methods.isOperational().call({ from: account});
    // }

    // async setDataContractOperationalStatus(status) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyData.methods.setOperationalStatus(status).send({ from: account});
    // }

    // async setAppContractOperationalStatus(status) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyApp.methods.setOperationalStatus(status).send({ from: account});
    // }

    // async authorizeAddress(address) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyData.methods.authorizeCaller(address).send({ from: account});    
    // }

    // async getAirline(airlineAddress) {
    //     let account = await this.getCurrentAccount();
    //     let result = await this.flightSuretyData.methods.getAirlineInformation(airlineAddress).call({ from: account});   
    //     return {
    //         name: result[0],
    //         isRegistered: result[1],
    //         isFunded: result[2],
    //         fudnedAmount: this.web3.utils.fromWei(result[3], 'ether')
    //     }
    // }

    // async registerAirline(airlineAddress, airlineName) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyApp.methods.registerAirline(airlineAddress, airlineName).send({ from: account});
    // }

    // async fundAirline(airlineAddress, amount) {
    //     let account = await this.getCurrentAccount();
    //     let amountWei = this.web3.utils.toWei(amount, 'ether');
    //     await this.flightSuretyApp.methods.fundAirline(airlineAddress).send({ from: account, value: amountWei });
    // }

    // async getFlight(flightNumber) {
    //     let account = await this.getCurrentAccount();
    //     let result = await this.flightSuretyData.methods.getFlightInformation(flightNumber).call({ from: account});  

    //     let status = "Unknown";
    //     switch (result[1]) {
    //         case "10":
    //             status = "On Time";
    //             break;
    //         case "20":
    //             status = "Late Airline";
    //             break;
    //         case "30":
    //             status = "Late Weather";
    //             break;
    //         case "40":
    //             status = "Late Technical";
    //             break;
    //         case "50":
    //             status = "Late Other";
    //             break;
    //     }
    //     return {
    //         isRegistered: result[0],
    //         statusCode: status,
    //         timestamp: result[2],
    //         airline: result[3]
    //     }
    // }

    // async registerFlight(flightNumber, dateTimestamp) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyApp.methods.registerFlight(flightNumber, dateTimestamp).send({ from: account });
    // }

    // async requestFlightStatus(flightNumber) {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyApp.methods.requestFlightStatus(flightNumber).send({ from: account});
    // }

    // async buyInsurance(flightNumber, amount) {
    //     let account = await this.getCurrentAccount();
    //     let amountWei = this.web3.utils.toWei(amount, 'ether'); 
    //     await this.flightSuretyApp.methods.buyInsurance(flightNumber).send({ from: account, value: amountWei });
    // }

    // async getBalance() {
    //     let account = await this.getCurrentAccount();
    //     let balance = await this.flightSuretyData.methods.getBalance().call({ from: account });
    //     return this.web3.utils.fromWei(balance, 'ether');
    // }

    // async withdrawBalance() {
    //     let account = await this.getCurrentAccount();
    //     await this.flightSuretyApp.methods.withdraw().send({ from: account });
    // }
}
