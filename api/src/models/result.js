const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "result";

const PlayerSchema = new mongoose.Schema({
  userId: { type: ObjectId },
  userName: { type: String, trim: true },
  avatar: { type: String, trim: true },

  score: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  flagsTouches: { type: Number, default: 0 }, 

  eloBefore: { type: Number, default: 1000 },
  eloAfter: { type: Number, default: 1000 },
});

const Schema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    mode: { type: String, trim: true, default: "2v2" },
    map: { type: String, trim: true, default: "ctf_5" },
    scoreLimit: { type: Number, default: 1000 },
    timeLimit: { type: Number, default: 0 },

    totalTimeSeconds: { type: Number, default: 0 },
    totalTimeMinutes: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },

    blueClanId: { type: ObjectId, trim: true },
    blueClanName: { type: String, trim: true },
    redClanId: { type: ObjectId, trim: true },
    redClanName: { type: String, trim: true },

    winnerId: { type: ObjectId, trim: true },
    winnerName: { type: String, trim: true },
    winnerSide: { type: String, trim: true, enum: ["red", "blue", "", null] },

    looserId: { type: ObjectId, trim: true },
    looserName: { type: String, trim: true },
    looserSide: { type: String, trim: true },

    blueScore: { type: Number, default: 0 },
    redScore: { type: Number, default: 0 },

    redPlayers: { type: [PlayerSchema], default: [] },
    bluePlayers: { type: [PlayerSchema], default: [] },

    eloGain: { type: Number, default: 0 },
    eloLoss: { type: Number, default: 0 },
    redEloBefore: { type: Number, default: 1000 },
    blueEloBefore: { type: Number, default: 1000 },
    redEloGain: { type: Number, default: 0 },
    blueEloGain: { type: Number, default: 0 },

    freezed: { type: Boolean, default: false },
    freezedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    date: this.date,
    mode: this.mode,
    map: this.map,
    scoreLimit: this.scoreLimit,
    timeLimit: this.timeLimit,
    blueClanId: this.blueClanId,
    blueClanName: this.blueClanName,
    redClanId: this.redClanId,
    redClanName: this.redClanName,
    winnerId: this.winnerId,
    winnerName: this.winnerName,
    winnerSide: this.winnerSide,
    looserId: this.looserId,
    looserName: this.looserName,
    looserSide: this.looserSide,
    blueScore: this.blueScore,
    redScore: this.redScore,
    redPlayers: this.redPlayers,
    bluePlayers: this.bluePlayers,
    eloGain: this.eloGain,
    eloLoss: this.eloLoss,
    redEloBefore: this.redEloBefore,
    blueEloBefore: this.blueEloBefore,
    redEloGain: this.redEloGain,
    blueEloGain: this.blueEloGain,
    freezed: this.freezed,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
