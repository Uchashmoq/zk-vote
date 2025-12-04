// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ZkAuth.sol";

contract ZkVote is ZkAuth {
    struct Candidate {
        uint256 votes;
        string meta;
    }
    string public meta;
    uint256 public startTime;
    uint256 public endTime;
    Candidate[] public candidates;
    mapping(bytes32 => bool) public isNullifierUsed;
    mapping(address => bool) public isVoter;
    uint256 public voterNum;

    event Vote(
        bytes32 indexed nullifier,
        uint256 indexed candidateId,
        address indexed voter
    );

    constructor(
        string memory _meta,
        string[] memory _candiateMetas,
        address[] memory _voters,
        uint256 _startTime,
        uint256 _endTime,
        address _hasher,
        address _verifier
    ) ZkAuth(_hasher, _verifier) {
        require(
            _endTime > block.timestamp,
            "endTime must be after the conctract is deployed"
        );
        require(_endTime >= _startTime, "endTime must be after startTime");
        startTime = _startTime;
        endTime = _endTime;
        for (uint256 i = 0; i < _candiateMetas.length; i++) {
            candidates.push(Candidate({votes: 0, meta: _candiateMetas[i]}));
        }
        for (uint256 i = 0; i < _voters.length; i++) {
            isVoter[_voters[i]] = true;
        }
        voterNum = _voters.length;
        meta = _meta;
    }

    function commit(bytes32 _commitment) public override {
        require(isVoter[msg.sender], "You are not voter");
        super.commit(_commitment);
    }

    function vote(
        uint256 _candidateId,
        bytes32 _nullifier,
        bytes32 _root,
        uint[2] calldata _proof_a,
        uint[2][2] calldata _proof_b,
        uint[2] calldata _proof_c
    ) public {
        require(block.timestamp >= startTime, "Voting has not started");
        require(block.timestamp <= endTime, "Voting has ended");
        require(!isNullifierUsed[_nullifier], "You have voted");
        auth(_nullifier, _root, _proof_a, _proof_b, _proof_c);
        candidates[_candidateId].votes += 1;
        isNullifierUsed[_nullifier] = true;
        emit Vote(_nullifier, _candidateId, msg.sender);
    }

    function candidateNum() public view returns (uint256) {
        return candidates.length;
    }
}
