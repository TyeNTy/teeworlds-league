const mongoose = require("mongoose");

const MODELNAME = "webhook";

const Schema = new mongoose.Schema(
  {
    action: { type: String },
    body: { type: String },
    endpointResult: { type: String },
    ok: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
