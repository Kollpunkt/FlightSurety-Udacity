import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';

import Config from './config.json';
import Web3 from 'web3';
import { config } from 'webpack';

export default class Contract {
    constructor(network, callback) {


        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
         
        this.initialize(callback, config);

        this.owner = null;
        this.airlines = [];
        
        this.passengers = [];






    }

    initialize(callback, config) {
        this.web3.eth.getAccounts(async (error, accts) => {
            let self = this;
            self.web3.eth.defaultAccount = accts[0];
            console.log(accts);
            console.log(accts[0]+' .  '+self.owner);
            self.owner = accts[0];
            console.log(accts[0]+' .  '+self.owner);
            
            //Authorize app contract to call data contract
            self.authorizeCaller(config.appAddress, async (error, result) => {});

            let counter = 1;
            let airlineNames = ['First Airways','Second Airways','Third Airways'];
            self.airlines.push({address: accts[0], name: "Contract owner Airways"});  //Owner is first Airline
            while(self.airlines.length < 4) {  //I do count the owner as airline, so only for other airlines are able to register without voting
                //let self = self;
                self.airlines.push({address: accts[counter], name: airlineNames[counter-1]});
                self.registerAirline(self.airlines[counter].address, self.airlines[counter].name, async (error, result) => {}); 
                counter++;
            }

            while(self.passengers.length < 5) {
                self.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
    //    let bothOperational = false;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
                
            //     (error,result) => {
            //     if(error){
            //         console.log(error);
            //     }else {
            //         // bothOperational = result;
            //         callback;
            //     }
            // });

        // self.flightSuretyData.methods
        //     .isOperational()
        //     .call({ from: self.owner }, (error,result) => {
        //         if(error){
        //             console.log(error);
        //         }else {
        //             bothOperational = bothOperational && result;  //Only operational when both contracts are operational
        //             callback;
        //         }
        //     });
    }
    
    authorizeCaller(address, callback){
        let self = this;
        self.flightSuretyData.methods
            .authorizeCaller(address)
            .call({ from: self.owner }, (error,result) => {
                if(error){
                    console.log(error);
                }else {
                    callback;
                }
            });
    }

    async registerAirline(address, name, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerAirlineApp(address,name)
            .call({ from: address}, callback );
    }

    fetchFlightStatus(flight, callback) {
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
}