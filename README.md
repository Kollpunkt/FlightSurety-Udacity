# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
![truffle test](Readme_pics/Tests.png)

`truffle test ./test/oracles.js`


To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Environment used
Truffle v5.7.7 (core: 5.7.7)
Ganache v7.7.5
Solidity - ^0.8.17 (solc-js)
Node v14.21.2
Web3.js v1.8.2

# Usage of Dapp

## 0. Update (Ganache) accounts in 2_deploy_contract.js
![truffle test](Readme_pics/Update_2_deploy_contracts.js.png)

## 1. Connect App contract to data contract
Use owner account (=account that contracts were deployed from)
![truffle test](Readme_pics/Contracts_section.png)

## 2. Register and fund airlines
Use owner account for registration. Both buttons are in relation to airline selected in drop-down.
![truffle test](Readme_pics/Airlines_section.png)

## 3. Register flight
![truffle test](Readme_pics/Flights_section.png)

## 4. Buy Insurance
![truffle test](Readme_pics/Passenger_section.png)

## 5. Trigger fetching flight information from oracles and trigger insurance claim processing
Go back to "Flights section" and press button "Check flight status & insurance" with owner account
![truffle test](Readme_pics/Flights_section.png)

## 6. Withdraw insurance pay out
First "Update Withdrawable amount" with passenger account. Then "Withdraw Insurance Payout"
![truffle test](Readme_pics/Passenger_section.png)

