const mongoose = require("mongoose");
const modes = require("../enums/enumModes");
const { enumMaps } = require("../enums/enumMaps");
const enumModes = require("../enums/enumModes");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "queue";

const PlayerSchema = new mongoose.Schema({
  userId: { type: ObjectId },
  userName: { type: String, trim: true },
  avatar: { type: String, trim: true },
  clanId: { type: ObjectId },
  clanName: { type: String, trim: true },
  elo: { type: Number },
  joinedAt: { type: Date, default: Date.now },
});

const Schema = new mongoose.Schema(
  {
    players: { type: [PlayerSchema], default: [] },
    maps: { type: [String], default: [enumMaps.ctf_5, enumMaps.ctf_duskwood, enumMaps.ctf_cryochasm, enumMaps.ctf_mars, enumMaps.ctf_moon] },
    mode: { type: String, enum: enumModes, default: enumModes.twoVTwo },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    players: this.players,
    maps: this.maps,
    mode: this.mode,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
