
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
  listButton.style.backgroundColor = "#797D7F";
  listButton.style.opacity = 0.3;
}
async function enableButton() {
  const listButton = document.getElementById("list-button");
  listButton.disabled = false;
  listButton.style.backgroundColor = "#694ACA";
  listButton.style.opacity = 1;
}
 
const returnError =(message)=>{ 
  closeLoadingModal()
  document.getElementById('error-modal').classList.remove('hidden');
  document.getElementById('errorMessage').innerText = message;
}
const listNFT = async () => {
  document.getElementById('loading-modal').classList.remove('hidden');
  
  disableButton() 
  console.log("fetching the response"); 
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
 
      document.getElementById('success-modal').classList.remove('hidden');
      closeLoadingModal()
      window.location.href = "/form"; 
      enableButton()
    } else {
      // returnError(data.err)
      returnError("Oops! Some error occured, please try again later or contact us if the problem still persist") 
      
    } 
    
  }catch(err){ 
    returnError("Oops! Some error occured, please try again later or contact us if the problem still persist") 
    // returnError(err) 
  }
};

