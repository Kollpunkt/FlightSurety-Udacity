import Contract from './contract';
import Config from './config.json';
import './flightsurety.css';

window.addEventListener('load', async () => {
    let contract = new Contract();
    await contract.initialize('localhost');


    // let dataContractAddress = await contract.getDataContractAddress();
    // document.getElementById('data-contract-address').value = dataContractAddress;

    // let appContractAddress = await contract.getAppContractAddress();
    // document.getElementById('app-contract-address').value = appContractAddress;
    // document.getElementById('address-to-authorize').value = appContractAddress;

    // let dataContractOperational = await contract.isDataContractOperational();
    // document.getElementById('data-contract-operational-status').checked = dataContractOperational;

    // let appContractOperational = await contract.isAppContractOperational();
    // document.getElementById('app-contract-operational-status').checked = appContractOperational;

    // document.getElementById('set-data-operational-status').addEventListener('click', async () => {
    //     let status = document.getElementById('data-contract-operational-status').checked;
    //     await contract.setDataContractOperationalStatus(status);
    // });

    // document.getElementById('set-app-operational-status').addEventListener('click', async () => {
    //     let status = document.getElementById('app-contract-operational-status').checked;
    //     await contract.setAppContractOperationalStatus(status);
    // });

    // document.getElementById('authorize-address').addEventListener('click', async () => {
    //     let address = document.getElementById('address-to-authorize').value;
    //     await contract.authorizeAddress(address);
    // });

    // document.getElementById('get-airline').addEventListener('click', async () => {
    //     let airlineAddress = document.getElementById('airline-address').value;
    //     let result = await contract.getAirline(airlineAddress);
    //     document.getElementById('airline-name').value = result.name;
    //     document.getElementById('airline-registered').checked = result.isRegistered;
    //     document.getElementById('airline-funded').checked = result.isFunded;
    //     document.getElementById('airline-funded-amount').value = result.fudnedAmount;
    // });

    // document.getElementById('register-airline').addEventListener('click', async () => {
    //     let airlineAddress = document.getElementById('register-airline-address').value;
    //     let airlineName = document.getElementById('register-airline-name').value;
    //     await contract.registerAirline(airlineAddress, airlineName);
    // });
    
    //Contract section


    document.getElementById('contract-register-app-contract').addEventListener('click', async () => {
        await contract.authorizeCaller();
    });

    document.getElementById('contract-register-oracles').addEventListener('click', async () => {
        let registrationFee = document.getElementById('contract-registration-fee').value;
        await contract.registerMultipleOracles(registrationFee);
    });

    //Airline section
    document.getElementById('airlines-register-airlines').addEventListener('click', async () => {
        let selectIndex = document.getElementById('airlines-airline-dropdown').value;
        let airline = await contract.getAirlineInfo(selectIndex);
        await contract.registerAirline(airline[0], airline[1]);
    });

    document.getElementById('fund').addEventListener('click', async () => {
        let selectIndex = document.getElementById('airlines-airline-dropdown').value;
        let airline = await contract.getAirlineInfo(selectIndex);
        let amount = document.getElementById('airlines-fund-amount').value;
        await contract.fundAirline(airline[0], amount);
    });

    // Flights section
    document.getElementById('flights-register-flight').addEventListener('click', async () => {
        let selectIndex = document.getElementById('flights-flights-dropdown').value;
        let flight = await contract.getFlightInfo(selectIndex);
        await contract.registerFlight(flight);
    });
    document.getElementById('flights-request-oracles').addEventListener('click', async () => {
        let selectIndex = document.getElementById('flights-flights-dropdown').value;
        let flight = await contract.getFlightInfo(selectIndex);
        await contract.fetchFlightStatus(flight);
    });

    // Passenger section
    document.getElementById('passengers-insurance-button').addEventListener('click', async () => {
        let selectIndex = document.getElementById('passengers-flights-dropdown').value;
        let flight = await contract.getFlightInfo(selectIndex);
        let amount = document.getElementById('passengers-insurance-amount').value;
        console.log(flight, amount)
        await contract.buyInsurance(flight, amount);
    });
    document.getElementById('passengers-withdraw-payout').addEventListener('click', async () => {
        await contract.withdrawPayout();
        let amount = await contract.getPayout();
        document.getElementById('passengers-value-payout').value = amount;
    });

    document.getElementById('passengers-get-payout').addEventListener('click', async () => {
        let amount = await contract.getPayout();
        document.getElementById('passengers-value-payout').value = amount;
        let amountDataContract = await contract.getFlightSuretyDataBalance();
        console.log(amountDataContract);
    });
});