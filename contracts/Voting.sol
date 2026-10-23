// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DecentralizedVoting
 * @dev Secure Voting System Using Face Recognition and Blockchain
 * Shri Sant Gajanan Maharaj College of Engineering, Shegaon
 * Department of Computer Science & Engineering
 */
contract DecentralizedVoting {
    // --- Structs ---
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string symbolUrl;
        string manifesto;
        uint256 voteCount;
    }

    struct Voter {
        string voterId;          // e.g. "VOTER-27"
        address voterAddress;
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 votedTimestamp;
    }

    enum ElectionState {
        Created,
        Active,
        Ended
    }

    // --- State Variables ---
    address public electionAdmin;
    string public electionTitle;
    ElectionState public state;
    
    uint256 public candidateCount;
    uint256 public registeredVoterCount;
    uint256 public totalVotesCasted;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;
    mapping(string => address) public voterIdToAddress;
    address[] public voterAddresses;

    // --- Events ---
    event ElectionStarted(uint256 timestamp);
    event ElectionEnded(uint256 timestamp, uint256 totalVotes);
    event ElectionReset(string newTitle, uint256 timestamp);
    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(string voterId, address indexed voterAddress);
    event VoteCast(address indexed voterAddress, string voterId, uint256 indexed candidateId, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == electionAdmin, "Only election admin can perform this action");
        _;
    }

    modifier inState(ElectionState _state) {
        require(state == _state, "Invalid election state for this action");
        _;
    }

    // --- Constructor ---
    constructor(string memory _electionTitle) {
        electionAdmin = msg.sender;
        electionTitle = _electionTitle;
        state = ElectionState.Created;
    }

    // --- Admin Functions ---

    /**
     * @dev Add a candidate to the ballot
     */
    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _symbolUrl,
        string memory _manifesto
    ) external onlyAdmin {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        require(state != ElectionState.Ended, "Cannot add candidates to ended election");

        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            symbolUrl: _symbolUrl,
            manifesto: _manifesto,
            voteCount: 0
        });

        emit CandidateAdded(candidateCount, _name, _party);
    }

    /**
     * @dev Register a voter address tied to a unique voterId (biometrically verified)
     */
    function registerVoter(string memory _voterId, address _voterAddress) public onlyAdmin {
        require(_voterAddress != address(0), "Invalid wallet address");
        require(bytes(_voterId).length > 0, "Voter ID required");
        require(!voters[_voterAddress].isRegistered, "Wallet address already registered");
        require(voterIdToAddress[_voterId] == address(0), "Voter ID already registered");

        voters[_voterAddress] = Voter({
            voterId: _voterId,
            voterAddress: _voterAddress,
            isRegistered: true,
            hasVoted: false,
            votedCandidateId: 0,
            votedTimestamp: 0
        });

        voterIdToAddress[_voterId] = _voterAddress;
        voterAddresses.push(_voterAddress);
        registeredVoterCount++;

        emit VoterRegistered(_voterId, _voterAddress);
    }

    /**
     * @dev Batch register voters
     */
    function batchRegisterVoters(string[] memory _voterIds, address[] memory _voterAddresses) external onlyAdmin {
        require(_voterIds.length == _voterAddresses.length, "Mismatched arrays length");
        for (uint256 i = 0; i < _voterIds.length; i++) {
            registerVoter(_voterIds[i], _voterAddresses[i]);
        }
    }

    /**
     * @dev Start the voting phase
     */
    function startElection() external onlyAdmin {
        require(state == ElectionState.Created || state == ElectionState.Ended, "Election cannot be started from current state");
        require(candidateCount >= 2, "Must have at least 2 candidates before starting");
        state = ElectionState.Active;
        emit ElectionStarted(block.timestamp);
    }

    /**
     * @dev End the voting phase
     */
    function endElection() external onlyAdmin inState(ElectionState.Active) {
        state = ElectionState.Ended;
        emit ElectionEnded(block.timestamp, totalVotesCasted);
    }

    /**
     * @dev Reset election for fresh demo/session
     */
    function resetElection(string memory _newTitle) external onlyAdmin {
        electionTitle = _newTitle;
        state = ElectionState.Created;
        
        // Reset candidate votes
        for (uint256 i = 1; i <= candidateCount; i++) {
            candidates[i].voteCount = 0;
        }

        // Reset voter voting records
        for (uint256 j = 0; j < voterAddresses.length; j++) {
            address vAddr = voterAddresses[j];
            voters[vAddr].hasVoted = false;
            voters[vAddr].votedCandidateId = 0;
            voters[vAddr].votedTimestamp = 0;
        }

        totalVotesCasted = 0;
        emit ElectionReset(_newTitle, block.timestamp);
    }

    // --- Voting Functions ---

    /**
     * @dev Cast a vote for a candidate. Requires voter registration & facial authentication prior to tx.
     */
    function castVote(uint256 _candidateId) external inState(ElectionState.Active) {
        Voter storage senderVoter = voters[msg.sender];

        require(senderVoter.isRegistered, "You are not registered as an eligible voter");
        require(!senderVoter.hasVoted, "Duplicate voting prohibited: You have already cast your vote");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate selected");

        // Record vote
        senderVoter.hasVoted = true;
        senderVoter.votedCandidateId = _candidateId;
        senderVoter.votedTimestamp = block.timestamp;

        // Increment candidate vote tally
        candidates[_candidateId].voteCount++;
        totalVotesCasted++;

        emit VoteCast(msg.sender, senderVoter.voterId, _candidateId, block.timestamp);
    }

    // --- View Functions ---

    /**
     * @dev Get all candidates
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory candArray = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            candArray[i - 1] = candidates[i];
        }
        return candArray;
    }

    /**
     * @dev Get details for a specific voter
     */
    function getVoter(address _voterAddress) external view returns (Voter memory) {
        return voters[_voterAddress];
    }

    /**
     * @dev Check vote status for sender
     */
    function checkMyVote() external view returns (bool isRegistered, bool hasVoted, uint256 votedCandidateId, uint256 votedTimestamp) {
        Voter memory v = voters[msg.sender];
        return (v.isRegistered, v.hasVoted, v.votedCandidateId, v.votedTimestamp);
    }

    /**
     * @dev Election overview summary
     */
    function getElectionSummary() external view returns (
        string memory title,
        address admin,
        ElectionState electionState,
        uint256 numCandidates,
        uint256 numRegisteredVoters,
        uint256 totalVotes
    ) {
        return (
            electionTitle,
            electionAdmin,
            state,
            candidateCount,
            registeredVoterCount,
            totalVotesCasted
        );
    }
}
