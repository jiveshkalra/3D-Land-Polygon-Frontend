console.log("nfts.js");
const GetIpfsUrlFromPinata = (pinataUrl) => {
  var IPFSUrl = pinataUrl.split("/");
  const lastIndex = IPFSUrl.length;
  IPFSUrl = "https://ipfs.io/ipfs/" + IPFSUrl[lastIndex - 1];
  return IPFSUrl;
};

export const purchaseNFT = async ()=>{
  const MarketplaceJSON = await fetch("/Marketplace").then((res) => res.json());
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const currentAddr = await signer.getAddress();
  let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
  var tokenURI = await contract.tokenURI(tokenId);
  const listedToken = await contract.getListedTokenForId(tokenId);
  tokenURI = GetIpfsUrlFromPinata(tokenURI);
  let response = await fetch(tokenURI);
  let meta = await response.json();
  meta = meta.data;
  console.log(listedToken);


}

export const getAllNFTs = async () => {
  let data = [{}];
  const MarketplaceJSON = await fetch("/Marketplace").then((res) => res.json());
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  let contract = new ethers.Contract(
    MarketplaceJSON.address,
    MarketplaceJSON.abi,
    signer
  );
  let transaction = await contract.getAllNFTs();

  const items = await Promise.all(
    transaction.map(async (i) => {
      try {
        var tokenURI = await contract.tokenURI(i.tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let response = await fetch(tokenURI);
        let meta = await response.json();
        if (meta.model_url == undefined) {

            return null;
        }

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          model_url: meta.model_url,
          model_name: meta.model_name,
          description: meta.description,
          category: meta.category,
        };
        return item;
      } catch (error) {
        console.log("Error fetching meta for token", i.tokenId);
        return null;
      }
    })
  );
  return await items;
}; 