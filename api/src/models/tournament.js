const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { enumTournamentStageType, enumTournamentStageStatus, enumTournamentStatus } = require("../enums/enumTournament");
const { enumNumberOfPlayersForGame } = require("../enums/enumModes");
const { enumMaps } = require("../enums/enumMaps");
const { enumModes } = require("../enums/enumModes");

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
  status: { type: String, enum: enumTournamentStageStatus, default: enumTournamentStageStatus.PENDING },

  numberOfPlayersForGame: { type: Number, default: enumNumberOfPlayersForGame.twoVTwo },
  numberOfPlayersPerTeam: { type: Number, default: 2 },
  maps: { type: [String], default: [enumMaps.ctf_5, enumMaps.ctf_duskwood, enumMaps.ctf_cryochasm, enumMaps.ctf_mars, enumMaps.ctf_moon] },
  mode: { type: String, enum: enumModes, default: enumModes.twoVTwo },

  modeId: { type: ObjectId, ref: "mode" },
  modeName: { type: String, trim: true },

  bestOf: { type: Number, default: 3 },

  numberOfTeamsQualified: { type: Number, default: 0 },

  details: { type: Object, default: {} },

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

    status: { type: String, enum: enumTournamentStatus, default: enumTournamentStatus.PENDING },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    registrationStartDate: { type: Date, default: Date.now },
    registrationEndDate: { type: Date, default: null },

    numberOfServers: { type: Number, default: 1 },

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

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
    registrationStartDate: this.registrationStartDate,
    registrationEndDate: this.registrationEndDate,
    numberOfServers: this.numberOfServers,
    twitchUrls: this.twitchUrls,
    numberOfPlayersPerTeam: this.numberOfPlayersPerTeam,
    registeredTeams: this.registeredTeams,
    stages: this.stages,
    classement: this.classement,
    winnerTeam: this.winnerTeam,
    secondTeam: this.secondTeam,
    thirdTeam: this.thirdTeam,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
