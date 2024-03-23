require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const pinataSDK = require("@pinata/sdk");

const cors = require("cors");
app.use(cors());

const path = require("path");
const crypto = require("crypto");
const multer_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/files");
  },
  filename: function (req, file, cb) {
    const filename = `${crypto.randomUUID()}_${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: multer_storage });

const pinata_secret = process.env.PINATA_SECRET;
const pinata_key = process.env.PINATA_KEY;
const pinata = new pinataSDK(pinata_key, pinata_secret);

app.use(express.static("public"));

app.post("/add", upload.any(), (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  if (req.body) {
    let id = crypto.randomUUID();
    var entry = {
      id: id,
      model_name: req.body.model_name,
      cost: req.body.cost,
      description: req.body.description,
      // tags: req.body.tags,
      category: req.body.category,
    };

    // Upload model file to storage
    model_file_path = req.files[0].path;
    model_file_filename = req.files[0].filename;
    const readableStreamForFile = fs.createReadStream(model_file_path);
    const options = {
      pinataMetadata: {
        name: model_file_filename,
        // keyvalues: {
        //   customKey: "customValue",
        //   customKey2: "customValue2",
        // },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    pinata
      .pinFileToIPFS(readableStreamForFile, options)
      .then((result) => {
        const url = "https://gateway.pinata.cloud/ipfs/" + result.IpfsHash;
        entry.model_url = url;
        const options = {
          pinataMetadata: {
            name: `${id}.json`,
          },
          pinataOptions: {
            cidVersion: 0,
          },
        };
        pinata
          .pinJSONToIPFS(entry, options)
          .then((result) => {
            const json_url =
              "https://gateway.pinata.cloud/ipfs/" + result.IpfsHash;
            console.log(json_url);
            return res.status(200).send({ url: json_url, status: "success" });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).send({ err: err, status: "failed" });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({ err: err, status: "failed" });
      });
  } else {
    res.status(400).send("Invalid request body");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public/form.html"));
});
app.get("/Marketplace", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Marketplace.json"));
});
app.listen(3000, () => console.log("listening at port 3000"));
