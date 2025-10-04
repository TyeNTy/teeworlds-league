const mongoose = require("mongoose");

const MODELNAME = "discordToken";

const Schema = new mongoose.Schema(
  {
    accessToken: { type: String },
    expiresAt: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
