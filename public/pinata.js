
 
const fs = require('fs');

import pinataSDK from 'https://cdn.jsdelivr.net/npm/@pinata/sdk@2.1.0/+esm'
const pinata = new pinataSDK({ pinataApiKey: key, pinataSecretApiKey: secret});
 
export const uploadFileToIPFS = async(file) => { 
    const readableStreamForFile = fs.createReadStream(file);
    const options = {
        pinataMetadata: {
            name: file.name,
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    const res = await pinata.pinFileToIPFS(readableStreamForFile, options)
    console.log(res)
    return {
        success:true,
        pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.IpfsHash
    }
}

export const uploadJSONToIPFS = async(JSONBody) => {
    const options = {
        pinataMetadata: {
            name: 'metadata.json',
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    const res = await pinata.pinJSONToIPFS(JSONBody, options)
    console.log(res)
}
 