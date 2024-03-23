// import * as ethers from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.11.1/ethers.umd.min.js"; 
window.main = async () => {
  let signer = null;
  let provider;
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.providers.Web3Provider(window.ethereum);
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    console.log("Connected to MetaMask account", account);
    signer = await provider.getSigner();
  }
};

async function disableButton() {
  const listButton = document.getElementById("list-button");
  listButton.disabled = true;
  listButton.style.backgroundColor = "grey";
  listButton.style.opacity = 0.3;
}
async function enableButton() {
  const listButton = document.getElementById("list-button");
  listButton.disabled = false;
  listButton.style.backgroundColor = "#A500FF";
  listButton.style.opacity = 1;
}
 
const listNFT = () => { 
  const formData = new FormData(document.querySelector("form"));
  fetch("/add", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data)
      if (data.status == "success") {
        alert("Model added successfully");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
          Marketplace.address,
          Marketplace.abi,
          signer
        );

        //massage the params to be sent to the create NFT request
        const price = ethers.utils.parseUnits(formParams.price, "ether");
        let listingPrice = await contract.getListPrice();
        listingPrice = listingPrice.toString();

        //actually create the NFT
        let transaction = await contract.createToken(metadataURL, price, {
          value: listingPrice,
        });
        await transaction.wait();

        alert("Successfully listed your NFT!");
        window.location.href = "/";
      } else {
        alert("Error adding model");
      }
    });
};
