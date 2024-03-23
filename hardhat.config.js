require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
// require dotenv 
require('dotenv').config(); 


module.exports = {
  defaultNetwork: "mumbai",
  networks: { 
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/gXvN7lF-9lqzgJvfQo8xa_PpIUoaX2D2",
      accounts: [ `0x${process.env.PRIVATE_KEY}` ]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};