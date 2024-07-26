require("dotenv").config();

const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static("build"));

const buildPath = path.resolve(__dirname, "../build");

app.get("*", (req, res) => {
    const indexPath = path.resolve(buildPath, "index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Page not found!");
    }
});

const options = {
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
};

https.createServer(options, app).listen(443, () => {
    console.log("HTTPS Server running on port 443");
});