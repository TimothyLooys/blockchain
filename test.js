const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedVoting Contract", function () {

    let Voting;
    let voting;
    let admin, voter1, voter2, voter3;
    let choice1 = ethers.utils.formatBytes32String("Choice1");
    let choice2 = ethers.utils.formatBytes32String("Choice2");

    beforeEach(async function () {
        [admin, voter1, voter2, voter3] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("DecentralizedVoting");
        voting = await Voting.deploy(ethers.utils.formatBytes32String("TestTopic"));
        await voting.deployed();
    });

    it("Should set the right admin", async function () {
        expect(await voting.admin()).to.equal(admin.address);
    });

    it("Admin should be able to register voters", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        const voterDetails = await voting.voters(voter1.address);
        expect(voterDetails.isRegistered).to.be.true;
    });

    it("Voter should not be registered twice", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await expect(voting.connect(admin).registerVoter(voter1.address))
            .to.be.revertedWith("Voter is already registered");
    });

    it("Non-admin should not be able to register voters", async function () {
        await expect(voting.connect(voter1).registerVoter(voter2.address))
            .to.be.revertedWith("Only admin can call this function");
    });

    it("Admin should be able to start voting", async function () {
        await voting.connect(admin).startVoting();
        expect(await voting.votingActive()).to.be.true;
    });

    it("Only admin can start voting", async function () {
        await expect(voting.connect(voter1).startVoting())
            .to.be.revertedWith("Only admin can call this function");
    });

    it("Admin should be able to end voting", async function () {
        await voting.connect(admin).startVoting();
        await voting.connect(admin).endVoting();
        expect(await voting.votingActive()).to.be.false;
    });

    it("Only admin can end voting", async function () {
        await expect(voting.connect(voter1).endVoting())
            .to.be.revertedWith("Only admin can call this function");
    });

    it("Registered voters should be able to cast a vote", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await voting.connect(admin).startVoting();
        await voting.connect(voter1).castVote(choice1);

        const voterDetails = await voting.voters(voter1.address);
        expect(voterDetails.hasVoted).to.be.true;

        const voteCount = await voting.voteCount(choice1);
        expect(voteCount).to.equal(1);
    });

    it("Voter cannot vote twice", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await voting.connect(admin).startVoting();
        await voting.connect(voter1).castVote(choice1);

        await expect(voting.connect(voter1).castVote(choice1))
            .to.be.revertedWith("Voter has already voted");
    });

    it("Unregistered voters cannot vote", async function () {
        await voting.connect(admin).startVoting();
        await expect(voting.connect(voter2).castVote(choice1))
            .to.be.revertedWith("Voter is not registered");
    });

    it("Cannot vote when voting is not active", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await expect(voting.connect(voter1).castVote(choice1))
            .to.be.revertedWith("Voting is not active");
    });

    it("Should get the correct result after voting ends", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await voting.connect(admin).registerVoter(voter2.address);
        await voting.connect(admin).startVoting();
        
        await voting.connect(voter1).castVote(choice1);
        await voting.connect(voter2).castVote(choice2);

        await voting.connect(admin).endVoting();
        
        expect(await voting.getResult(choice1)).to.equal(1);
        expect(await voting.getResult(choice2)).to.equal(1);
    });

    it("Should get the correct winner after voting ends", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await voting.connect(admin).registerVoter(voter2.address);
        await voting.connect(admin).registerVoter(voter3.address);
        await voting.connect(admin).startVoting();
        
        await voting.connect(voter1).castVote(choice1);
        await voting.connect(voter2).castVote(choice2);
        await voting.connect(voter3).castVote(choice1);

        await voting.connect(admin).endVoting();

        expect(await voting.getWinner()).to.equal(choice1);
    });

    it("Should not allow getting results while voting is active", async function () {
        await voting.connect(admin).registerVoter(voter1.address);
        await voting.connect(admin).startVoting();
        await voting.connect(voter1).castVote(choice1);

        await expect(voting.getResult(choice1))
            .to.be.revertedWith("Voting is still active");
    });
});
