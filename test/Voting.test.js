const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedVoting Smart Contract", function () {
  let votingContract;
  let admin, voter1, voter2, unauthorizedUser;

  beforeEach(async function () {
    [admin, voter1, voter2, unauthorizedUser] = await ethers.getSigners();

    const VotingFactory = await ethers.getContractFactory("DecentralizedVoting");
    votingContract = await VotingFactory.deploy("SSGMCE Student Council Election 2026-2027");
    await votingContract.waitForDeployment();
  });

  it("should initialize with correct title, admin, and Created state", async function () {
    const summary = await votingContract.getElectionSummary();
    expect(summary[0]).to.equal("SSGMCE Student Council Election 2026-2027");
    expect(summary[1]).to.equal(admin.address);
    expect(summary[2]).to.equal(0); // Created
    expect(summary[3]).to.equal(0); // numCandidates
    expect(summary[4]).to.equal(0); // numRegisteredVoters
    expect(summary[5]).to.equal(0); // totalVotes
  });

  it("should allow admin to add candidates", async function () {
    await votingContract.addCandidate("Aarav Sharma", "Tech Progressive Party", "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav", "Innovation and Transparency");
    await votingContract.addCandidate("Priya Patel", "Student Welfare Alliance", "https://api.dicebear.com/7.x/bottts/svg?seed=Priya", "Campus Health and Sports");

    const candidates = await votingContract.getAllCandidates();
    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Aarav Sharma");
    expect(candidates[0].voteCount).to.equal(0);
    expect(candidates[1].name).to.equal("Priya Patel");
  });

  it("should allow admin to register voters with biometric voterId", async function () {
    await votingContract.registerVoter("VOTER-27", voter1.address);
    const voter = await votingContract.getVoter(voter1.address);
    expect(voter.isRegistered).to.be.true;
    expect(voter.hasVoted).to.be.false;
    expect(voter.voterId).to.equal("VOTER-27");
  });

  it("should prevent non-admin from registering voters or adding candidates", async function () {
    await expect(
      votingContract.connect(unauthorizedUser).addCandidate("Fake", "Fake Party", "", "")
    ).to.be.revertedWith("Only election admin can perform this action");

    await expect(
      votingContract.connect(unauthorizedUser).registerVoter("VOTER-99", unauthorizedUser.address)
    ).to.be.revertedWith("Only election admin can perform this action");
  });

  it("should enforce election state flow and allow registered voters to vote", async function () {
    // Add 2 candidates
    await votingContract.addCandidate("Candidate 1", "Party A", "", "Manifesto A");
    await votingContract.addCandidate("Candidate 2", "Party B", "", "Manifesto B");

    // Register voters
    await votingContract.registerVoter("VOTER-27", voter1.address);
    await votingContract.registerVoter("VOTER-28", voter2.address);

    // Vote before start should fail
    await expect(
      votingContract.connect(voter1).castVote(1)
    ).to.be.revertedWith("Invalid election state for this action");

    // Start election
    await votingContract.startElection();

    // Voter 1 casts vote for candidate 1
    const tx = await votingContract.connect(voter1).castVote(1);
    await expect(tx)
      .to.emit(votingContract, "VoteCast")
      .withArgs(voter1.address, "VOTER-27", 1, (val) => val > 0);

    // Check voter status
    const voterStatus = await votingContract.getVoter(voter1.address);
    expect(voterStatus.hasVoted).to.be.true;
    expect(voterStatus.votedCandidateId).to.equal(1);

    // Candidate 1 should have 1 vote
    const candidates = await votingContract.getAllCandidates();
    expect(candidates[0].voteCount).to.equal(1);
    expect(candidates[1].voteCount).to.equal(0);

    // Voter 1 attempting duplicate vote should be reverted
    await expect(
      votingContract.connect(voter1).castVote(1)
    ).to.be.revertedWith("Duplicate voting prohibited: You have already cast your vote");

    // Unregistered user voting should fail
    await expect(
      votingContract.connect(unauthorizedUser).castVote(2)
    ).to.be.revertedWith("You are not registered as an eligible voter");

    // Voter 2 votes for candidate 2
    await votingContract.connect(voter2).castVote(2);

    // End election
    await votingContract.endElection();

    // Voting after end should fail
    await expect(
      votingContract.connect(voter2).castVote(1)
    ).to.be.revertedWith("Invalid election state for this action");

    const summary = await votingContract.getElectionSummary();
    expect(summary[2]).to.equal(2); // Ended
    expect(summary[5]).to.equal(2); // totalVotes = 2
  });
});
