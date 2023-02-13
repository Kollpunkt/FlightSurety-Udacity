
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`1a) (multiparty) direct call to data contract is denied`, async function () {

    let accessDenied = false;
    try 
    {
        let status = await config.flightSuretyData.isOperational.call();
    }
    catch(e) {
        accessDenied = true;
    }
    assert.equal(accessDenied, true, "Data contract function isOperational could be accessed directly");

  });

  it(`1b) (multiparty) call through App contract is granted and  correct initial isOperational() value is`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperationalApp.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`2) First 4 airlines can be registered without voting`, async function () {
    //register airlines
    await config.flightSuretyApp.registerAirlineApp(config.testAddresses[1], "Airline 1", { from: config.testAddresses[0] });      
    await config.flightSuretyApp.registerAirlineApp(config.testAddresses[2], "Airline 2", { from: config.testAddresses[1] });
    await config.flightSuretyApp.registerAirlineApp(config.testAddresses[3], "Airline 3", { from: config.testAddresses[2] });
    // As Contract owner is first Airline these three are enough
    
    //Check whether airlines were registered
    let successA1 = await config.flightSuretyData.isAcceptedAirline(config.testAddresses[1]);
    let successA2 = await config.flightSuretyData.isAcceptedAirline(config.testAddresses[2]); 
    let successA3 = await config.flightSuretyData.isAcceptedAirline(config.testAddresses[3]);  

    // assert
    assert.equal(successA1, true, "Airline 1 could not be registered");
    assert.equal(successA2, true, "Airline 2 could not be registered");
    assert.equal(successA3, true, "Airline 3 could not be registered");
     
  
    });
    
    it(`3) Fifth airline cannot be registered without voting`, async function () {
        //register airlines
        await config.flightSuretyApp.registerAirlineApp(config.testAddresses[4], "Airline 4", { from: config.testAddresses[0] });      

        let successA4 = await config.flightSuretyData.isVotingAirline(config.testAddresses[4]);

        assert.equal(successA4, false, "Airline 4 could be registered without a vote");
      
    });
    it(`4a) Funding: paying less than required amount returns money and does not change funding status`, async function () {
        let fundingReverted = false;
        try 
        {
            let status = await config.flightSuretyApp.fundAirlineApp(config.testAddresses[1], {value: 9, from: config.testAddresses[1]});
        }
        catch(e) {
            fundingReverted = true;
        }
    
        //Check that isFunded is stille false
        let isFunded = await config.flightSuretyData.isFundedAirline(config.testAddresses[1]);      
        
        assert.equal(fundingReverted, true, "Airline 1 Funding was not reverted despite too low funding");
        assert.equal(isFunded, false, "Airline 1 Funding status changed despite too low funding");

      
    });
    it(`4b) Funding: Funding is possible with right funding amount`, async function () {
        let fundingReverted = false;
        try 
        {
            let fundingReverted = await config.flightSuretyApp.fundAirlineApp(config.testAddresses[1], {value: 10, from: config.testAddresses[1], gasPrice: 0});
        }
        catch(e) {
            fundingReverted = true;
        }
    
        //Check that isFunded changed to true
        let isFunded = await config.flightSuretyData.isFundedAirline(config.testAddresses[1]);      
        
        assert.equal(fundingReverted, false, "Airline 1 Funding was reverted despite the correct funding");
        assert.equal(isFunded, true, "Airline 1 Funding status did not changed to true despite correct funding");

      
    });
    it(`4c) Funding: Funding is accumulated in contract`, async function () {
        let dataContractValueBegin = await web3.eth.getBalance(config.flightSuretyData.address);

        await config.flightSuretyApp.fundAirlineApp(config.testAddresses[2], {value: 12, from: config.testAddresses[2], gasPrice: 0}); 
        await config.flightSuretyApp.fundAirlineApp(config.testAddresses[3], {value: 10, from: config.testAddresses[3], gasPrice: 0});

        let dataContractValueEnd = await web3.eth.getBalance(config.flightSuretyData.address);


        //Check that isFunded changed to true
        let isFunded2 = await config.flightSuretyData.isFundedAirline(config.testAddresses[2]);
        let isFunded3 = await config.flightSuretyData.isFundedAirline(config.testAddresses[3]);  
        
        assert.equal(dataContractValueEnd - dataContractValueBegin, 20, "Not the right amount accumlated after 2 further fundings");
        assert.equal(isFunded2, true, "Airline 2 Funding status did not changed to true despite correct funding");
        assert.equal(isFunded3, true, "Airline 3 Funding status did not changed to true despite correct funding");

      
    });

    it(`4d) Funding: Fifth airline can be funded before being accepted/ voted in`, async function () {
        let dataContractValueBegin = await web3.eth.getBalance(config.flightSuretyData.address);
        console.log(dataContractValueBegin);
        await config.flightSuretyApp.fundAirlineApp(config.testAddresses[4], {value: 10, from: config.testAddresses[4], gasPrice: 0}); 

        let dataContractValueEnd = await web3.eth.getBalance(config.flightSuretyData.address);
        console.log(dataContractValueEnd);

        //Check that isFunded changed to true
        let isFunded4 = await config.flightSuretyData.isFundedAirline(config.testAddresses[4]);

        
        assert.equal(dataContractValueEnd - dataContractValueBegin, 10, "Not the right amount accumlated after 2 further fundings");
        assert.equal(isFunded4, true, "Fifth airline funding status did not changed to true despite correct funding");


      
    });

    it(`5a) Airline voting: Fifth airline cannot be registered with only one vote`, async function () {
        
        await config.flightSuretyApp.voteAirlineInApp(config.testAddresses[4], { from: config.testAddresses[1] });


        let successA4a = await config.flightSuretyData.isVotingAirline(config.testAddresses[4]);


        assert.equal(successA4a, false, "Airline 4 could be registered without a vote"); 
    });

    it(`5b) Airline voting: Fifth airline cannot be registered with a double vote by same airline`, async function () {
        var votingDenied = false; 
        try {
            await config.flightSuretyApp.voteAirlineInApp(config.testAddresses[4], { from: config.testAddresses[1] }); 
        }
        catch(e) {
            var votingDenied = true;
        }
        
        assert.equal(votingDenied, true, "Airline 4 could be registered without a vote"); 
    });

    it(`5c) Airline voting: Fifth airline can be registered with a second vote out of four airlines)`, async function () {
        

        await config.flightSuretyApp.voteAirlineInApp(config.testAddresses[4], { from: config.testAddresses[2] });
        //await config.flightSuretyApp.voteAirlineInApp(config.testAddresses[4], { from: config.testAddresses[3] });
        let successA4b = await config.flightSuretyData.isVotingAirline(config.testAddresses[4]);


        assert.equal(successA4b, true, "Airline 4 could be registered without a vote"); 
    });
    it(`5d) Airline voting: Another vote (3rd of 4) for fifth airline runs into error that voting is closed`, async function () {
        var votingsuccess = true;
        try 
        {
            await config.flightSuretyApp.voteAirlineInApp(config.testAddresses[4], { from: config.testAddresses[3] })
        }
        catch(e) {
            var votingsuccess = false;
        } 

        assert.equal(votingsuccess, false, "Third out of four votes did not return error due to voting being closed"); 
    });
  it(`5) (multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setOperatingStatusApp(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`6) Fifth airline cannot vote without funding`, async function () 
   {       
    });

  it(`7) Fifth airline can be funded and then can vote`, async function () 
  {       
  });
 
  it(`8) (multiparty) can change operating status with setOperatingStatus() with M=2`, async function () {        
        //two registered airlines vot for "false"
        await config.flightSuretyApp.setOperatingStatusApp(false, { from: config.testAddresses[1] });
        await config.flightSuretyApp.setOperatingStatusApp(false, { from: config.testAddresses[2] });

        //status changed to false
        let status = true;
        status = await config.flightSuretyApp.isOperationalApp.call();
        assert.equal(status, false, "Operating status value did not change from true to false"); 
      
  });

  it(`9) (multiparty) cannot activate setOperatingStatus() with M=1`, async function () {
    //
    // await config.flightSuretyApp.registerAirlineApp(config.testAddresses[1], "Airline 1", { from: config.testAddresses[0] });      
    // await config.flightSuretyApp.registerAirlineApp(config.testAddresses[2], "Airline 2", { from: config.testAddresses[1] });
    
    let beginnStatus = true;
    beginnStatus = await config.flightSuretyApp.isOperationalApp.call();
  
    await config.flightSuretyApp.setOperatingStatusApp(!beginnStatus, { from: config.testAddresses[1] });


    let endStatus = true;
    endStatus = await config.flightSuretyApp.isOperationalApp.call();
    assert.equal(endStatus, beginnStatus, "Operating status value did not change from true to false"); 
  
});

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyApp.setOperatingStatusApp(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 

});
