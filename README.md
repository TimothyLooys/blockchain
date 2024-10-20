
# Decentralized Voting Smart Contract

## Overview

This is a decentralized voting system built on the Ethereum blockchain using Solidity. It allows for secure, transparent, and decentralized voting by registered voters. The contract is designed to have a single admin who manages the voting process, including registering voters, starting and ending voting, and tallying the results. Voters are required to register before voting and can only cast their vote once.

## Features

- **Admin Control**: Only the contract admin can register voters, start voting, and end voting.
- **Voter Registration**: Only registered voters are allowed to cast votes.
- **Single Vote**: Each registered voter can vote only once.
- **Vote Tallying**: The contract tallies votes for different choices and provides the ability to view the result and determine the winner after voting ends.
- **Transparency**: All actions are transparent, and events are emitted for important actions like voter registration, voting, and ending the voting period.

## Contract Functions

### 1. **Constructor**
   ```solidity
   constructor(bytes32 _topic)
   ```
   Initializes the contract with a voting `topic`, and the deployer becomes the admin. Voting is set as active upon deployment.

### 2. **Admin Functions**
   - **registerVoter(address _voter)**: Registers a new voter. Can only be called by the admin.
     ```solidity
     function registerVoter(address _voter) external onlyAdmin
     ```
   - **startVoting()**: Starts the voting process. Can only be called by the admin.
     ```solidity
     function startVoting() external onlyAdmin
     ```
   - **endVoting()**: Ends the voting process. Can only be called by the admin.
     ```solidity
     function endVoting() external onlyAdmin
     ```

### 3. **Voter Functions**
   - **castVote(bytes32 _choice)**: Allows a registered voter to cast a vote for a specific choice.
     ```solidity
     function castVote(bytes32 _choice) external onlyRegistered onlyActive
     ```

### 4. **View Functions**
   - **getResult(bytes32 _choice)**: Returns the total votes for a given choice. This can only be called after voting has ended.
     ```solidity
     function getResult(bytes32 _choice) external view returns (uint256)
     ```
   - **getWinner()**: Returns the choice with the highest number of votes after voting has ended.
     ```solidity
     function getWinner() external view returns (bytes32)
     ```

## Events

- **VoterRegistered(address voter)**: Emitted when a voter is successfully registered.
- **VoteCasted(address voter, bytes32 choice)**: Emitted when a voter casts their vote.
- **VotingEnded()**: Emitted when the admin ends the voting process.

## Usage

### 1. **Deploying the Contract**
   Deploy the contract by passing the voting topic as a `bytes32` argument to the constructor. You can convert a string (e.g., "Election2024") into `bytes32` using the following:

   **Example**:
   ```javascript
   ethers.utils.formatBytes32String("TopicName")
   ```
   This `topic` can now be passed into the contract constructor during deployment.

### 2. **Registering Voters**
   The admin must call the `registerVoter` function to register each voter. Example:
   ```solidity
   decentralizedVotingInstance.registerVoter(voterAddress);
   ```

### 3. **Starting and Ending Voting**
   The admin starts the voting with `startVoting()` and ends it with `endVoting()`.

### 4. **Casting Votes**
   Registered voters can cast their votes by calling the `castVote` function with the desired choice as a `bytes32` argument.
   ```javascript
   decentralizedVotingInstance.castVote(ethers.utils.formatBytes32String("Choice1"));
   ```

### 5. **Getting the Result**
   After voting has ended, anyone can query the results of the vote for a particular choice:
   ```javascript
   const result = await decentralizedVotingInstance.getResult(ethers.utils.formatBytes32String("Choice1"));
   console.log(result);
   ```

### 6. **Getting the Winner**
   The winner (the choice with the most votes) can be retrieved after voting ends:
   ```javascript
   const winner = await decentralizedVotingInstance.getWinner();
   console.log(ethers.utils.parseBytes32String(winner));
   ```

