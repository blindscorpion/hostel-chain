import { expect } from 'chai';
import '@nomiclabs/hardhat-waffle';
import { ethers } from 'hardhat';
import { BigNumber, Contract, ContractFactory, Signer } from 'ethers';
import * as hre from 'hardhat';

import erc20Abi from "../artifacts/contracts/IERC20.sol/IERC20.json";


let accounts: Signer[];
let deployer: Signer;
let user: Signer[];
let bookingFactory: Contract;
let usdcToken: Contract;
let usdcWhale: Signer;
const usdcTokenAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';



describe('Hostel Chain Deployment', function () {
    before(async () => {
        accounts = await ethers.getSigners();
        [deployer, ...user] = accounts;

        // Impersonate user to give funds
        await hre.network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: ['0x25FCa2F41E4d086eEcCd4A9FBC6334cd8a70963C'],
        });
        usdcWhale = await hre.ethers.getSigner(
          '0x25FCa2F41E4d086eEcCd4A9FBC6334cd8a70963C'
        );
        await hre.network.provider.send('hardhat_setBalance', [
          '0x25FCa2F41E4d086eEcCd4A9FBC6334cd8a70963C',
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ]);

        usdcToken = new ethers.Contract(
          usdcTokenAddress,
          erc20Abi.abi,
          deployer
        );
        
        let usdcTokenSender: Contract = usdcToken.connect(usdcWhale);
        await usdcTokenSender.approve(deployer.getAddress(), ethers.constants.MaxUint256);
        const usdcAmt = ethers.utils.parseUnits("2000", 6);
        await usdcTokenSender.transfer(deployer.getAddress(), usdcAmt)
      });

      it("Should deploy Booking Factory", async function () {
        const BookingFactory = await ethers.getContractFactory("BookingFactory");
        bookingFactory = await BookingFactory.deploy();
        await bookingFactory.deployed();
    
        expect(bookingFactory.address);
      });

      it("Should make a booking", async function () {
        let name: string = "Alice";
        let roomNumber: number = 23;
        let checkInDate: number = Math.floor(new Date('2022.01.01').getTime() / 1000);
        let numDaysStayed: number = 4;
        let dailyPrice: BigNumber = ethers.utils.parseUnits("130", 6);
        let totalPrice: number = dailyPrice.toNumber() * numDaysStayed;
        await usdcToken.approve(bookingFactory.address, ethers.constants.MaxUint256);
        await bookingFactory.makeBooking(name, roomNumber, checkInDate, numDaysStayed, dailyPrice, totalPrice, deployer.getAddress());
        let booking = await bookingFactory.bookings(0, deployer.getAddress());
        expect(booking.name).to.equals("Alice");
        let bookingFactoryBalance = await usdcToken.balanceOf(bookingFactory.address);
        expect(bookingFactoryBalance).to.equals(totalPrice);
      });

      it("Should not double book or exploit timestamp", async function () {
        var date = new Date('2022.01.03');
        var startOfDay: Date = new Date(date.setHours(0,0,0,0));
        var timestamp = startOfDay.getTime() / 1000;
        console.log(timestamp)
        let name: string = "Bob";
        let roomNumber: number = 23;
        let checkInDate: number = timestamp + 100;
        let numDaysStayed: number = 4;
        let dailyPrice: BigNumber = ethers.utils.parseUnits("130", 6);
        let totalPrice: number = dailyPrice.toNumber() * numDaysStayed;
        await expect(bookingFactory.makeBooking(name, 
          roomNumber, 
          checkInDate, 
          numDaysStayed, 
          dailyPrice, 
          totalPrice, 
          deployer.getAddress()
          )).to.be.revertedWith("Timestamp must be mod 86400");
        let newCheckInDate = timestamp;
        await expect(bookingFactory.makeBooking(name, 
          roomNumber, 
          newCheckInDate, 
          numDaysStayed, 
          dailyPrice, 
          totalPrice, 
          deployer.getAddress()
          )).to.be.revertedWith("Room is Booked");
        });

});

/*

*/