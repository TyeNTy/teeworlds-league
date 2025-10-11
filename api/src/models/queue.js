const mongoose = require("mongoose");
const modes = require("../enums/enumModes");
const { enumMaps } = require("../enums/enumMaps");
const { enumModes, enumNumberOfPlayersForGame } = require("../enums/enumModes");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "queue";

const PlayerSchema = new mongoose.Schema({
  userId: { type: ObjectId },
  userName: { type: String, trim: true },
  avatar: { type: String, trim: true },
  clanId: { type: ObjectId },
  clanName: { type: String, trim: true },
  discordId: { type: String, trim: true },
  elo: { type: Number },
  joinedAt: { type: Date, default: Date.now },
});

const Schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "2v2" },

    players: { type: [PlayerSchema], default: [] },
    numberOfPlayersForGame: { type: Number, default: enumNumberOfPlayersForGame.twoVTwo },
    numberOfPlayersPerTeam: { type: Number, default: 2 },
    maps: { type: [String], default: [enumMaps.ctf_5, enumMaps.ctf_duskwood, enumMaps.ctf_cryochasm, enumMaps.ctf_mars, enumMaps.ctf_moon] },
    mode: { type: String, enum: enumModes, default: enumModes.twoVTwo },

    modeId: { type: ObjectId },
    modeName: { type: String, trim: true },

    numberOfGames: { type: Number, default: 0 },

    // Discord
    guildId: { type: String, trim: true },
    categoryQueueId: { type: String, trim: true },
    textChannelDisplayQueueId: { type: String, trim: true },
    textChannelDisplayResultsId: { type: String, trim: true },
    messageQueueId: { type: String, trim: true },
    joinButtonId: { type: String, trim: true },
    leaveButtonId: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    name: this.name,
    players: this.players,
    maps: this.maps,
    mode: this.mode,
    modeId: this.modeId,
    modeName: this.modeName,
    numberOfPlayersForGame: this.numberOfPlayersForGame,
    numberOfPlayersPerTeam: this.numberOfPlayersPerTeam,
    numberOfGames: this.numberOfGames,
    guildId: this.guildId,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
