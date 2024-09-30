const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const enumUserRole = require("../enums/enumUserRole");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "announcement";

const Schema = new mongoose.Schema(
  {
    redClanId: { type: ObjectId, trim: true },
    redClanName: { type: String, trim: true },
    blueClanId: { type: ObjectId, trim: true },
    blueClanName: { type: String, trim: true },

    date: { type: Date },
    mode: { type: String, trim: true, default: "2v2" },
    moderator: { type: ObjectId, trim: true },
    streams: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
