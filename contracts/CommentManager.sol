// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CommentManager {
    struct Comment {
        address sender;
        string content;
    }
    mapping(address => Comment[]) public comments;

    function addComment(address target, string calldata content) public {
        comments[target].push(Comment({sender: msg.sender, content: content}));
    }

    function getComments(
        address target
    ) public view returns (Comment[] memory) {
        return comments[target];
    }

    function getCommentNum(address target) public view returns (uint256) {
        return comments[target].length;
    }
}
