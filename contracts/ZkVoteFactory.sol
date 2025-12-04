// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ZkVote.sol";

contract ZkVoteFactory {
    ZkVote[] public votes;
    address public immutable hasher;
    address public immutable verifier;
    mapping(address => address) public creatorOfVote;

    event VoteCreated(
        address indexed addr,
        address indexed creator,
        string voteMeta,
        uint256 startTime,
        uint256 endTime
    );

    constructor(address _hasher, address _verifier) {
        hasher = _hasher;
        verifier = _verifier;
    }

    function voteNum() public view returns (uint256) {
        return votes.length;
    }

    function allVotes() public view returns (ZkVote[] memory) {
        return votes;
    }

    function createVote(
        string memory _voteMeta,
        string[] memory _candiateMetas,
        address[] memory _voters,
        uint256 _startTime,
        uint256 _endTime
    ) public returns (address voteAddr) {
        ZkVote vote = new ZkVote(
            _voteMeta,
            _candiateMetas,
            _voters,
            _startTime,
            _endTime,
            hasher,
            verifier
        );
        voteAddr = address(vote);
        votes.push(vote);
        creatorOfVote[voteAddr] = msg.sender;
        emit VoteCreated(voteAddr, msg.sender, _voteMeta, _startTime, _endTime);
    }
}
