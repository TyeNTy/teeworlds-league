const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "statRanked";
const Schema = new mongoose.Schema(
  {
    userId: { type: ObjectId },
    userName: { type: String },
    avatar: { type: String },

    discordId: { type: String },

    modeId: { type: ObjectId },
    modeName: { type: String },

    clanId: { type: ObjectId },
    clanName: { type: String },

    elo: { type: Number, default: 1000 },

    numberGames: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },

    redTotalScore: { type: Number, default: 0 },
    blueTotalScore: { type: Number, default: 0 },

    redTotalKills: { type: Number, default: 0 },
    blueTotalKills: { type: Number, default: 0 },

    redTotalDeaths: { type: Number, default: 0 },
    blueTotalDeaths: { type: Number, default: 0 },

    redTotalFlags: { type: Number, default: 0 },
    blueTotalFlags: { type: Number, default: 0 },

    redKdRatio: { type: Number, default: 0 },
    blueKdRatio: { type: Number, default: 0 },

    totalKills: { type: Number, default: 0 },
    averageKills: { type: Number, default: 0 },

    totalDeaths: { type: Number, default: 0 },
    averageDeaths: { type: Number, default: 0 },

    totalFlags: { type: Number, default: 0 },
    averageFlags: { type: Number, default: 0 },

    kdRatio: { type: Number, default: 0 },

    numberWins: { type: Number, default: 0 },
    numberLosses: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    redWinRate: { type: Number, default: 0 },
    blueWinRate: { type: Number, default: 0 },

    highestScore: { type: Number, default: 0 },
    highestScoreResultId: { type: ObjectId },
    highestKills: { type: Number, default: 0 },
    highestKillResultId: { type: ObjectId },
    highestDeaths: { type: Number, default: 0 },
    highestDeathResultId: { type: ObjectId },
    highestFlags: { type: Number, default: 0 },
    highestFlagResultId: { type: ObjectId },
    highestKdRatio: { type: Number, default: 0 },
    highestKdRatioResultId: { type: ObjectId },

    averageRedTeamScore: { type: Number, default: 0 },
    highestRedTeamScore: { type: Number, default: 0 },
    highestRedTeamScoreResultId: { type: ObjectId },

    averageBlueTeamScore: { type: Number, default: 0 },
    highestBlueTeamScore: { type: Number, default: 0 },
    highestBlueTeamScoreResultId: { type: ObjectId },

    averageWinningScore: { type: Number, default: 0 },
    averageLosingScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
