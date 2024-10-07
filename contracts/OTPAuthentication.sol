// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OTPAuthentication {
    uint256 public currentOtp; // Ensure this is declared only once
    address public otpOwner;
    bool public otpGenerated;

    event OTPGenerated(address indexed user, uint256 otp);
    event OTPValidated(address indexed user, bool isValid);

    function generateOTP() public returns (uint256) {
        require(!otpGenerated, "An OTP has already been generated and not used.");
        
        // Generate a new OTP (for example, a random number)
        currentOtp = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 1000000; // Random 6-digit OTP
        otpOwner = msg.sender;
        otpGenerated = true;

        emit OTPGenerated(msg.sender, currentOtp);
        return currentOtp;
    }

    function validateOTP(uint256 userOtp) public {
        require(otpGenerated, "No OTP has been generated.");
        bool isValid = (userOtp == currentOtp);
        
        emit OTPValidated(msg.sender, isValid);

        // Resetting state after validation
        otpGenerated = false; // Allow generating a new OTP
    }
}