// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ZkAuth.sol";

contract ZkVoteQuadratic is ZkAuth {
    struct Candidate {
        uint256 votes;
        string meta;
    }
    string public meta;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    Candidate[] public candidates;
    mapping(bytes32 => bool) public isNullifierUsed;
    mapping(address => bool) public isVoter;
    address[] public voters;
    uint256 public immutable quota;

    event Vote(
        bytes32 indexed nullifier,
        uint256[] candidateIds,
        address indexed voter
    );

    constructor(
        string memory _meta,
        string[] memory _candiateMetas,
        address[] memory _voters,
        uint256 _startTime,
        uint256 _endTime,
        address _hasher,
        address _verifier,
        uint256 _quota
    ) ZkAuth(_hasher, _verifier) {
        require(
            _endTime > block.timestamp,
            "endTime must be after the conctract is deployed"
        );
        require(_endTime >= _startTime, "endTime must be after startTime");
        startTime = _startTime;
        endTime = _endTime;
        quota = _quota;
        for (uint256 i = 0; i < _candiateMetas.length; i++) {
            candidates.push(Candidate({votes: 0, meta: _candiateMetas[i]}));
        }
        for (uint256 i = 0; i < _voters.length; i++) {
            isVoter[_voters[i]] = true;
        }
        voters = _voters;
        meta = _meta;
    }

    function commit(bytes32 _commitment) public override {
        require(isVoter[msg.sender], "You are not voter");
        super.commit(_commitment);
    }

    function vote(
        uint256[] memory _candidateIds,
        bytes32 _nullifierHash,
        bytes32 _root,
        uint[2] calldata _proof_a,
        uint[2][2] calldata _proof_b,
        uint[2] calldata _proof_c
    ) public virtual {
        require(block.timestamp >= startTime, "Voting has not started");
        require(block.timestamp <= endTime, "Voting has ended");
        require(!isNullifierUsed[_nullifierHash], "You have voted");
        auth(_nullifierHash, _root, _proof_a, _proof_b, _proof_c);
        for (uint256 i = 0; i < _candidateIds.length; i++) {
            candidates[_candidateIds[i]].votes++;
        }
        uint256 cost = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 votes = candidates[i].votes;
            cost += votes ** 2;
        }
        require(cost <= quota, "Quadratic quota exceeded");

        isNullifierUsed[_nullifierHash] = true;
        emit Vote(_nullifierHash, _candidateIds, msg.sender);
    }

    function candidateNum() public view returns (uint256) {
        return candidates.length;
    }

    function voterNum() public view returns (uint256) {
        return voters.length;
    }

    function allVotes() public view returns (address[] memory) {
        return voters;
    }

    function allCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}
