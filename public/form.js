
const main= async () => {
  let signer = null;
  let provider;
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    return account[0]
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    console.log("Connected to MetaMask account", account[0]);
    signer = await provider.getSigner();
    return account[0]
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
 
const listNFT = async () => {
  disableButton() 
  console.log("fetching the response");
  // Show a modal saying that the nft is being created and not to close the page or etc 
  const formData = new FormData(document.querySelector("form")); 
  formData.append("seller_wallet", await main());
  try{
    
  let response = await fetch("/add", {
    method: "POST",
    body: formData,
  }) 
  const Marketplace = await fetch("/Marketplace").then((res) => res.json());
  let data =  await response.json()   
    if (data.status == "success") {
      console.log("Model added successfully");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );
 
      const price = ethers.utils.parseUnits(formData.get('cost'), "ether");
       let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();
 
      let transaction = await contract.createToken(data.url, price, {
        value: listingPrice,
      });
      await transaction.wait();

      alert("Successfully listed your NFT!");
      window.location.href = "/form"; 
      enableButton()
    } else {
      alert("Error adding model");
      
    } 
    
  }catch(err){
    alert("Error adding model");
    console.error(err)
    // show a message to the user that the model was not added successfully

  }
};

