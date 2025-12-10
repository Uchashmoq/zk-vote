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

    function check(
        ZkVote v,
        address creator,
        address committedVoter,
        bool hideNotStarted,
        bool hideEnded
    ) private view returns (bool) {
        if (creator != address(0)) {
            if (creatorOfVote[address(v)] != creator) return false;
        }

        if (committedVoter != address(0)) {
            if (!v.isCommitted(committedVoter)) return false;
        }

        if (hideNotStarted) {
            if (v.startTime() > block.timestamp) return false;
        }

        if (hideEnded) {
            if (v.endTime() < block.timestamp) return false;
        }

        return true;
    }

    function queryVote(
        address creator,
        address committedVoter,
        bool hideNotStarted,
        bool hideEnded
    )
        public
        view
        returns (address[] memory voteAddrs, string[] memory voteMetas)
    {
        uint256 cnt = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (
                check(
                    votes[i],
                    creator,
                    committedVoter,
                    hideNotStarted,
                    hideEnded
                )
            ) {
                cnt++;
            }
        }
        voteAddrs = new address[](cnt);
        voteMetas = new string[](cnt);
        uint256 j = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (
                check(
                    votes[i],
                    creator,
                    committedVoter,
                    hideNotStarted,
                    hideEnded
                )
            ) {
                voteAddrs[j] = address(votes[i]);
                voteMetas[j] = ZkVote(votes[i]).meta();
                j++;
            }
        }
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
