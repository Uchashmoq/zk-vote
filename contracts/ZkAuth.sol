// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./MerkleTree.sol";
import "./Verifier.sol";

contract ZkAuth is MerkleTree {
    mapping(bytes32 => bool) public isCommitmentUsed;
    mapping(address => bool) public isCommitted;
    address public immutable verifier;

    event Commit(
        bytes32 indexed commitment,
        uint32 indexed leafIndex,
        uint256 timestamp
    );

    function callVerifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] memory _pubSignals
    ) public view returns (bool verified) {
        bytes memory data = abi.encodeWithSelector(
            bytes4(
                keccak256(
                    "verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[2])"
                )
            ),
            _pA,
            _pB,
            _pC,
            _pubSignals
        );
        bytes memory returnData;
        bool success;
        (success, returnData) = verifier.staticcall(data);
        require(success, "Failed to call verify");
        if (success && returnData.length > 0) {
            verified = abi.decode(returnData, (bool));
        }
    }

    function commit(bytes32 _commitment) public virtual {
        require(!isCommitted[msg.sender], "You have already committed");
        require(
            !isCommitmentUsed[_commitment],
            "Your commitment has been used"
        );
        isCommitted[msg.sender] = true;
        isCommitmentUsed[_commitment] = true;
        uint32 index = _insert(_commitment);
        emit Commit(_commitment, index, block.timestamp);
    }

    function auth(
        bytes32 _nullifier,
        bytes32 _root,
        uint[2] calldata _proof_a,
        uint[2][2] calldata _proof_b,
        uint[2] calldata _proof_c
    ) public view virtual {
        require(isKnownRoot(_root), "Unknown root");
        require(
            callVerifyProof(
                _proof_a,
                _proof_b,
                _proof_c,
                [uint256(_nullifier), uint256(_root)]
            ),
            "Invalid proof"
        );
    }

    constructor(address _hasher, address _verifier) MerkleTree(_hasher) {
        verifier = _verifier;
    }
}
