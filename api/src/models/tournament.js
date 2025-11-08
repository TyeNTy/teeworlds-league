const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { enumTournamentStageType } = require("../enums/enumTournament");

const MODELNAME = "tournament";

const TeamSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  players: { type: [ObjectId], ref: "user", default: [] },
  disqualifiedAt: { type: Date, default: null },
  registeredAt: { type: Date, default: Date.now },
});

const StageSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  teams: { type: [TeamSchema], default: [] },
  type: { type: String, enum: enumTournamentStageType },

  numberOfPlayersForGame: { type: Number, default: enumNumberOfPlayersForGame.twoVTwo },
  numberOfPlayersPerTeam: { type: Number, default: 2 },
  maps: { type: [String], default: [enumMaps.ctf_5, enumMaps.ctf_duskwood, enumMaps.ctf_cryochasm, enumMaps.ctf_mars, enumMaps.ctf_moon] },
  mode: { type: String, enum: enumModes, default: enumModes.twoVTwo },

  modeId: { type: ObjectId, ref: "mode" },
  modeName: { type: String, trim: true },

  bestOf: { type: Number, default: 3 },

  numberOfTeamsQualified: { type: Number, default: 0 },

  results: { type: [ResultSchema], default: [] },
  ongoingResults: { type: [ResultSchema], default: [] },
  nextResults: { type: [ResultSchema], default: [] },

  classement: { type: [TeamSchema], default: [] },
  qualifiedTeams: { type: [TeamSchema], default: [] },
  disqualifiedTeams: { type: [TeamSchema], default: [] },

  estimatedStartDate: { type: Date, default: null },
  startDate: { type: Date, default: null },
  estimatedEndDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
});

const Schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    registrationStartDate: { type: Date, default: Date.now },
    registrationEndDate: { type: Date, default: null },

    twitchUrls: { type: [String], default: [] },

    numberOfPlayersPerTeam: { type: Number, default: 2 },
    registeredTeams: { type: [TeamSchema], default: [] },

    stages: { type: [StageSchema], default: [] },

    classement: { type: [TeamSchema], default: [] },

    winnerTeam: { type: TeamSchema, default: null },
    secondTeam: { type: TeamSchema, default: null },
    thirdTeam: { type: TeamSchema, default: null },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
