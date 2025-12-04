// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MerkleTree {
    address public immutable hasher;
    uint32 public constant levels = 20;
    uint256 public constant FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant ZERO_VALUE =
        uint256(keccak256("zk-vote")) % FIELD_SIZE;
    uint32 public constant ROOT_HISTORY_SIZE = 32;
    uint32 public nextIndex = 0;
    uint32 public currentRootIndex = 0;

    mapping(uint256 => bytes32) public filledSubtrees;
    bytes32[ROOT_HISTORY_SIZE] public roots;

    constructor(address _hasher) {
        hasher = _hasher;
        for (uint32 i = 0; i < levels; i++) {
            filledSubtrees[i] = zeros(i);
        }

        roots[0] = zeros(levels - 1);
    }

    function _insert(bytes32 _leaf) internal returns (uint32 index) {
        uint32 _nextIndex = nextIndex;
        require(_nextIndex != uint32(2) ** levels, "Merkle tree is full");
        uint32 currentIndex = _nextIndex;
        bytes32 currentLevelHash = _leaf;
        bytes32 left;
        bytes32 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros(i);
                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }
            currentLevelHash = hashLeftRight(left, right);
            currentIndex /= 2;
        }

        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = currentLevelHash;
        nextIndex = _nextIndex + 1;
        return _nextIndex;
    }

    function isKnownRoot(bytes32 _root) public view returns (bool) {
        if (_root == 0) {
            return false;
        }
        uint32 _currentRootIndex = currentRootIndex;
        uint32 i = _currentRootIndex;
        do {
            if (_root == roots[i]) {
                return true;
            }
            if (i == 0) {
                i = ROOT_HISTORY_SIZE;
            }
            i--;
        } while (i != _currentRootIndex);
        return false;
    }

    function hashLeftRight(
        bytes32 _left,
        bytes32 _right
    ) public view returns (bytes32) {
        require(
            uint256(_left) < FIELD_SIZE,
            "_left should be inside the field"
        );
        require(
            uint256(_right) < FIELD_SIZE,
            "_right should be inside the field"
        );
        uint256 R = uint256(_left);
        uint256 C = 0;
        (R, C) = callMiMCSponge(R, C);
        R = addmod(R, uint256(_right), FIELD_SIZE);
        (R, C) = callMiMCSponge(R, C);
        return bytes32(R);
    }

    function callMiMCSponge(
        uint256 in_xL,
        uint256 in_xR
    ) private view returns (uint256 xL, uint256 xR) {
        bytes memory data = abi.encodeWithSignature(
            "MiMCSponge(uint256,uint256,uint256)",
            in_xL,
            in_xR,
            0
        );

        (bool ok, bytes memory ret) = hasher.staticcall(data);
        require(ok, "call MiMCSponge failed");
        (xL, xR) = abi.decode(ret, (uint256, uint256));
    }

    function zeros(uint256 i) public pure returns (bytes32) {
        if (i == 0)
            return
                bytes32(
                    0x1553f19f8ce43eafdf26a68617b80dfa803a09c335ba6678f10ac98d26de405a
                );
        else if (i == 1)
            return
                bytes32(
                    0x2185e69564da5249ccf9b72974baa50e256a4171a0c8145feaaf97937f5b68ca
                );
        else if (i == 2)
            return
                bytes32(
                    0x03347706e0aebae326843b6f8ea8fa93aad63262019b36611d10c7e37d028e56
                );
        else if (i == 3)
            return
                bytes32(
                    0x1bbd01667f4b2623589a73da958912375d5e8188048f78d47cecb5c0f99a52d0
                );
        else if (i == 4)
            return
                bytes32(
                    0x10dfc0d3bf0d64f70795bba93d6538ea267c28742bd9fd7c6bce7a7d7e31e74d
                );
        else if (i == 5)
            return
                bytes32(
                    0x22e29cc0cff4621c8f6933fd427dfb906ec290affb563679c83187d96e2ef2c6
                );
        else if (i == 6)
            return
                bytes32(
                    0x2369cd44931188628734859cdef5f728aff09ce812740c979de7697dffd4052c
                );
        else if (i == 7)
            return
                bytes32(
                    0x08650f7f384345546c89f9a84ca66726a6e74f1e24f4328a93da2a3886e47e5b
                );
        else if (i == 8)
            return
                bytes32(
                    0x2733735e876df3704c1a143aa89ad826a4f4308e571f1e559e2817887f9dd182
                );
        else if (i == 9)
            return
                bytes32(
                    0x094d92190ac051438323434d3ed5c39a1255b7810935a12aff64977cabcb9153
                );
        else if (i == 10)
            return
                bytes32(
                    0x17a489de275adf4549f98011770a6e152e41bb4ed984e60abd544042813f1e52
                );
        else if (i == 11)
            return
                bytes32(
                    0x2d86a7ab4fbe8ea2fe5316c1e74db19cba44c77530de044aac8c247b07b4d394
                );
        else if (i == 12)
            return
                bytes32(
                    0x20c4653531c639ac2cadc74ef7bc2c0d3375c6119600a7f8f56e6fda447d1a12
                );
        else if (i == 13)
            return
                bytes32(
                    0x2844d7096208cdafc88417e373c00ef9f0cb774bc54588ace62a10e028c26f24
                );
        else if (i == 14)
            return
                bytes32(
                    0x0bfe89265a3951b962761e89e7761e8544d57677f592b8c7070053f90e2684de
                );
        else if (i == 15)
            return
                bytes32(
                    0x282e94d14d8cc150915637c9b967da33e3b7dcc34002493d06112780059b9e62
                );
        else if (i == 16)
            return
                bytes32(
                    0x1ca038c5100717bb737f9473afba2c3210b6e33e39fcf80599c9f5c7471590df
                );
        else if (i == 17)
            return
                bytes32(
                    0x2fb4699e08f2eb2fca4e816bfb36c48907f02134fb1284048641759b58975137
                );
        else if (i == 18)
            return
                bytes32(
                    0x1c115202d8902ac076013899be4dfb1c753377cf2bb25e0ee3ce52f9f5469952
                );
        else if (i == 19)
            return
                bytes32(
                    0x0a0d6495c33d14ef15535a04c02f5bc8958e15d97807ac819f40f375878a919e
                );
        else if (i == 20)
            return
                bytes32(
                    0x09a6f766c85f5ca250c12a022c4726916fad7b8d77a16964b83539c918a27e77
                );
        else if (i == 21)
            return
                bytes32(
                    0x29f2487bfc042d47403d60cd2aa7c9dfd2514d6e7e237181a02a0184f2c32379
                );
        else if (i == 22)
            return
                bytes32(
                    0x00f9daf014cf8c0de461584a1a42647de2b8ba580c291f093b274611b28b3830
                );
        else if (i == 23)
            return
                bytes32(
                    0x05ade03528fd6efb2ae1acbbe4903dea138a6499f6a9ba08cf05bf95eae8f2b0
                );
        else if (i == 24)
            return
                bytes32(
                    0x2a0b6464e04796390bf9119a29887f81293afceaf9f7920a6c0c5c07c3874339
                );
        else if (i == 25)
            return
                bytes32(
                    0x0903fb3157324920c4ced144bba1782a86912724dabbf6fa7c48ac99f16f84c0
                );
        else if (i == 26)
            return
                bytes32(
                    0x01ad6385236bca6201ed7f7fd4771f61993097099a607a58f0a85f6769ca4df1
                );
        else if (i == 27)
            return
                bytes32(
                    0x2db1ae04d4bdaa3644854b23801a6f81bdde74c81fc56fb4d40d91a391139a38
                );
        else if (i == 28)
            return
                bytes32(
                    0x29dadfbda1caa78b30c222005a357cf8ace038e0060ff13aae23fc25da5f3979
                );
        else if (i == 29)
            return
                bytes32(
                    0x19624c81f4a50cfadaa0d0a3cfab251db1b8f73041db5cb68d66d2b13c82b7f0
                );
        else if (i == 30)
            return
                bytes32(
                    0x0265be9f138f6b9a8f30af4cfe6935841866700cc18fb937c9a920f93b8df25e
                );
        else if (i == 31)
            return
                bytes32(
                    0x2eb2f210bd606ec9b271970741c89fab7f8ffc27befa5cd79a2ba11155a402ef
                );
        else revert("Index out of bounds");
    }
}
