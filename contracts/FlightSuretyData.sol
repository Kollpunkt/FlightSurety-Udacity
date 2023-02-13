pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    struct airlineStructType {                                          //struc for airlines
        string name;                
        bool isFunded;                                                          // funded
        bool isAccepted;                                                        // accepted to be airline
        uint256 ID;                                                             // ID to identify airline
    }


    mapping(address => airlineStructType) private airlines;

    uint256 airlineCount;                                                       // used to set ID

    struct passengerStrucType{
        address passengerAddress;
        mapping (bytes32 => uint256) insuredFlights;
        uint256 credit;
    }
    mapping(address => passengerStrucType) private passengers;

    
    
    
    address private contractOwner;                                      // Account used to deploy contract
    
    mapping (address => uint256) authorizedContracts;                   // App contracts that are allowed by owner to call this data contract

    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint constant M=2;                                                  //Defines number of votes needed set operational status
    address[] multiCalls = new address[](0);                           //array to identify whether address already voted for setOperational() status

    uint256 airlineToVoteFor = 0;                                       // Which airline is currently voted to be registered - referring to airlineStructType.ID
    address[] multiCallsAirlineVote = new address[](0);                 //array to identify whether address already voted for voteAirlineIn() status



    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event AirlineVoteCasted(uint256 voteNumber, address airlineToVoteFor);
    event SuccessfulAirlineVoteCasted(uint256 voteNumber, uint256 voteHurdle, address airlineToVoteFor);
     

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        //Contract owner is automtically registered as 
        airlines[msg.sender].name = "ContractOwnerAirline";
        airlines[msg.sender].isFunded = true;
        airlines[msg.sender].isAccepted = true;
        airlines[msg.sender].ID=1;

        //Set airline count for airlines[].ID setting
        airlineCount = 1;
         
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not authrized contract");
        _;
    }
    /**
    * @dev Modifier that requires caller to be airline
    *      
    */

    function isAirline(address _address) external view returns(bool)
    {
        bool _isAirline;
        if (airlines[_address].ID != 0) {
            _isAirline = true;
        }  else {
            _isAirline = false;
        }
        return(_isAirline);

    }

    /**
    * @dev Modifier that requires caller to be airline that can be
    *      Voting requires funding and being accepted by other airlines
    */
    function isVotingAirline(address _address) public view returns(bool)
    {
        bool _isVotingAirline; 
        _isVotingAirline = false;
        if (        (airlines[_address].ID != 0) && 
                    (airlines[_address].isFunded) && 
                    (airlines[_address].isAccepted)) {
                      _isVotingAirline = true;  
                    }
        return(_isVotingAirline);  
    }

        /**
    * @dev Function to retrieve airlinedata 
    *      
    */
    function isFundedAirline(address _address) public view returns(bool)
    {
        require(airlines[_address].ID != 0, "Airline not in data set.");
        return(airlines[_address].isFunded);  
    }
    function isAcceptedAirline(address _address) public view returns(bool)
    {
        require(airlines[_address].ID != 0, "Airline not in data set.");
        return(airlines[_address].isAccepted);  
    }


    /********************************************************************************************/
    /*                                 REFERENCE DATA APP CONTRACT  FUNCTIONS                   */
    /********************************************************************************************/

    /**
    * @dev authorize contract
    *
    * @return A bool that is the current operating status
    */      
    function authorizeCaller(address appContract) 
                                                    external 
                                                    requireContractOwner {
        authorizedContracts[appContract] = 1;
    } 

    function deauthorizeCaller(address appContract) 
                                                    external 
                                                    requireContractOwner {
        delete authorizedContracts[appContract];
    } 
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            requireCallerAuthorized
                            returns(bool) 

    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode,
                                address appUserAddress
                            ) 
                            external
                            requireCallerAuthorized                         
    {

        require(isVotingAirline(appUserAddress), "Caller is not funded and registered airline");
        require(mode != operational, "New mode must be different from existing mode");
        bool isDuplicate = false;
        for(uint c=0; c<multiCalls.length; c++) {
            if (multiCalls[c] == appUserAddress) {
                isDuplicate = true;
                break;
            }
        }
        require(!isDuplicate, "Caller has already called this function.");

        multiCalls.push(appUserAddress);
        if (multiCalls.length >= M) {
            operational = mode;      
            multiCalls = new address[](0);      

    }

    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (
                                address appUserAddress,
                                address airlineAddress,
                                string calldata name
                            )
                            external
                            requireCallerAuthorized

    {   //First 3 airlines can be registered without vote, afterwards an airline can only be regietered if the voting for the previous airline is concluded
        require((airlineToVoteFor==0) ||
                (airlineCount<=3)        , "There is currently an unfinished registration process going on. Please finish that first");
        
        airlineCount = airlineCount.add(1);
        airlines[airlineAddress].ID = airlineCount;
        airlines[airlineAddress].name = name;
        airlines[airlineAddress].isFunded = false;
        
        //The first four airlines are registered/accepted without a vote
        if (airlineCount<=4) {
            
            airlines[airlineAddress].isAccepted = true;
        } else {
            airlines[airlineAddress].isAccepted = false;

            
            // Opening  vote for this airline
            airlineToVoteFor = airlineCount;
        }
    }
    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function voteAirlineIn
                            (
                                address airlineCastedVoteFor,
                                address appUserAddress
                            ) 
                            external
                            requireCallerAuthorized                         
    {

        require(isVotingAirline(appUserAddress), "Caller is not funded and registered airline");
        require(airlines[airlineCastedVoteFor].ID == airlineToVoteFor, "Vote casted for the wrong airline");
        bool isDuplicate = false;
        for(uint c=0; c<multiCallsAirlineVote.length; c++) {
            if (multiCallsAirlineVote[c] == appUserAddress) {
                isDuplicate = true;
                break;
            }
        }
        require(!isDuplicate, "Caller has already called this function.");

        multiCallsAirlineVote.push(appUserAddress);
        uint256 hurdle = airlineCount.sub(1).div(2);
        if (multiCallsAirlineVote.length >= hurdle) {
            // Airline is accepted
            airlines[airlineCastedVoteFor].isAccepted = true;


            emit SuccessfulAirlineVoteCasted(multiCallsAirlineVote.length, hurdle, airlineCastedVoteFor);

            //Airlinevote is reset
            airlineToVoteFor = 0;      
            multiCallsAirlineVote = new address[](0);      
        } else {
            emit AirlineVoteCasted(multiCallsAirlineVote.length, airlineCastedVoteFor);
        }
    }
    /**
    * @dev Sets contract operations on/off
    *
    * Contract owner can reset any ongoing vote with leaving the airline that is voted for unregistered
    */    
    function resetAirlineVote
                            (
                            ) 
                            external
                            requireCallerAuthorized
                            requireContractOwner


    {
            airlineToVoteFor = 0;
            multiCallsAirlineVote = new address[](0);      
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fundAirline
                            (
                                address airline
                            )
                            public
                            payable
                            requireCallerAuthorized
                            requireIsOperational
    {
        // Airline must be registered first
        require(airlines[airline].ID != 0, "No data for this airline yet. Please register airline first.");
        // Avoid double funding
        require(airlines[airline].isFunded=true,"airline is already fully funded.");
        
        airlines[airline].isFunded = true;
        

    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {

    }


}

