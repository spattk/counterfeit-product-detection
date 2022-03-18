pragma solidity >=0.4.22 <0.9.0;


contract ProductTracking {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string currentStatus;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write candidates
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    constructor() public {
        addCandidate("Product 1");
        addCandidate("Product 2");
        addCandidate("Product 3");
        addCandidate("Product 4");
        addCandidate("Product 5");
        addCandidate("Product 6");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, "IN-WAREHOUSE");
    }

    // function vote (uint _candidateId) public {
    //     // require that they haven't voted before
    //     require(!voters[msg.sender]);

    //     // require a valid candidate
    //     require(_candidateId > 0 && _candidateId <= candidatesCount);

    //     // record that voter has voted
    //     voters[msg.sender] = true;

    //     // update candidate vote Count
    //     candidates[_candidateId].voteCount ++;
    // }

    function vote (uint _candidateId) public {
    // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
        candidates[_candidateId].currentStatus = 'IN-TRANSIT';

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}