pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;
    // Adopting a pet
    function adopt(uint weedId) public returns (uint) {
        require(weedId >= 0 && weedId <= 20);

        adopters[weedId] = msg.sender;

        return weedId;
    }
    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

}