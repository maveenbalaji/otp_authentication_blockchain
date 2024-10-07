const { default: Web3 } = require('web3'); // Correct import for Web3
const fs = require('fs'); // File system module to read files
const path = require('path'); // Module to handle file paths
const readline = require('readline'); // Module for reading user input

// Connect to local Ganache blockchain
const web3 = new Web3("http://127.0.0.1:8545"); // Directly provide the URL

// Path to your contract's JSON file
const contractPath = path.join(__dirname, '..', 'build', 'contracts', 'OTPAuthentication.json');

// Read the contract ABI and address from the JSON file
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAddress = contractJSON.networks['1664'].address; // Use the network ID you specified in Ganache
const contractABI = contractJSON.abi; // Get the ABI from the JSON

// Create an interface for reading user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function checkBlockchain() {
    try {
        // Get the current block number
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(`Current Block Number: ${blockNumber}`);

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log('Available Accounts:');
        accounts.forEach((account, index) => {
            console.log(`${index}: ${account}`);
        });

        // Check balance of the first account
        const balance = await web3.eth.getBalance(accounts[0]);
        console.log(`Balance of ${accounts[0]}: ${web3.utils.fromWei(balance, 'ether')} ETH`);

    } catch (error) {
        console.error('Error interacting with blockchain:', error);
    }
}

async function generateOTP() {
    try {
        const accounts = await web3.eth.getAccounts();
        
        // Interacting with the deployed contract
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        
        // Generate OTP by calling the smart contract method
        const result = await contract.methods.generateOTP().send({ from: accounts[0] });
        
        // Retrieve the generated OTP from the event
        const otpEvent = result.events.OTPGenerated.returnValues.otp;
        
        // Log the generated OTP to the console
        console.log(`Generated OTP for ${accounts[0]}: ${otpEvent}`);

        return otpEvent; // Return OTP for further validation

    } catch (error) {
        console.error('Error generating OTP:', error);
    }
}

async function validateOTP(userOtp) {
    try {
        const accounts = await web3.eth.getAccounts();
        
        // Interacting with the deployed contract
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        
        // Validate OTP by calling the smart contract method
        const result = await contract.methods.validateOTP(userOtp).send({ from: accounts[0] });
        
        // Log whether the OTP is valid or not
        console.log(`Validation result for OTP ${userOtp}: ${result.events.OTPValidated.returnValues.isValid}`);
        
    } catch (error) {
        console.error('Error validating OTP:', error);
    }
}

// Function to display details of a specific block
async function displayBlockDetails(blockNumber) {
    try {
        const block = await web3.eth.getBlock(blockNumber, true); // true to get transaction details
        
        console.log(`\nDetails of Block Number: ${blockNumber}`);
        console.log(`Hash: ${block.hash}`);
        console.log(`Parent Hash: ${block.parentHash}`);
        console.log(`Nonce: ${block.nonce}`);
        console.log(`Transactions:`);

        if (block.transactions.length > 0) {
            block.transactions.forEach(tx => {
                console.log(`  - Hash: ${tx.hash}, From: ${tx.from}, To: ${tx.to}, Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
            });
        } else {
            console.log(`  No transactions in this block.`);
        }

    } catch (error) {
        console.error('Error fetching block details:', error);
    }
}

// Execute both functions
async function main() {
    await checkBlockchain();  // Check blockchain status
    const generatedOtp = await generateOTP();      // Generate and display OTP
    
    if (generatedOtp) {
      rl.question('Please enter the OTP to validate: ', async (inputOtp) => {
          await validateOTP(inputOtp);  // Validate user-provided OTP 
          rl.close();  // Close readline interface after validation

          // Display details of the latest block after validation
          const latestBlockNumber = await web3.eth.getBlockNumber();
          await displayBlockDetails(latestBlockNumber);
      });
    }
}

main();