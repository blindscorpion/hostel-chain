//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DateTime.sol";

contract BookingFactory is ERC721, DateTime {
    using SafeERC20 for IERC20;

    address public constant USDC_ADDRESS =
        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    struct GuestInfo {
        string name;
        uint roomNumber;
        uint checkInDate;
        uint numDaysStayed;
        uint dailyPrice;
        uint totalPrice;
        address guestAddress;
    }


    GuestInfo public guestInfo;
    uint256 public tokenCounter;

    mapping(uint256 => mapping(address => GuestInfo)) public bookings;
    mapping(uint256 => mapping(uint256 => bool)) public roomBooked;

    constructor ()
    ERC721("Booking Factory", "BOOK")
    {
        tokenCounter = 0;
    }

    function makeBooking (
        string memory _name,
        uint _roomNumber,
        uint _checkInDate,
        uint _numDaysStayed,
        uint _dailyPrice,
        uint _totalPrice,
        address _guestAddress
    ) public returns (uint256) {
    bool success = _acceptPayment(_totalPrice);
    require(success, "USD transfer failed");
    _bookRooms(_checkInDate, _numDaysStayed, _roomNumber);
    _safeMint(msg.sender, tokenCounter);
    bookings[tokenCounter][msg.sender] = GuestInfo({
        name: _name,
        roomNumber: _roomNumber,
        checkInDate: _checkInDate,
        numDaysStayed: _numDaysStayed,
        dailyPrice: _dailyPrice,
        totalPrice: _totalPrice,
        guestAddress: _guestAddress
    });
    tokenCounter = tokenCounter + 1;
    return tokenCounter - 1;
    }

    function _acceptPayment(uint256 _paymentAmt) internal returns (bool) {
        IERC20(USDC_ADDRESS).safeTransferFrom(
            msg.sender,
            address(this),
            _paymentAmt
        );
        return true;
    }

    function _bookRooms(uint _checkInDate, uint _numDaysStayed, uint _roomNumber) internal {
        require(_checkInDate % 86400 == 0, "Timestamp must be mod 86400");
        for(uint i=0; i<_numDaysStayed; i++) {
            require(roomBooked[_roomNumber][_checkInDate + (i * DAY_IN_SECONDS)] == false, "Room is Booked");
            roomBooked[_roomNumber][_checkInDate + (i * DAY_IN_SECONDS)] = true;
        }
    }

}