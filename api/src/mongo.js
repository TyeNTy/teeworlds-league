const mongoose = require("mongoose");
const { MONGODB_ENDPOINT } = require("./config.js");

console.log("Connecting to mongoDB...");
mongoose
  .connect(MONGODB_ENDPOINT)
  .then((r) => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("Connection failed", error);
  });

mongoose.Promise = global.Promise; //Get the default connection
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("CONNECTED OK"));

module.exports = db;