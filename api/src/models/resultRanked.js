const mongoose = require("mongoose");
const { enumModes } = require("../enums/enumModes");
const { enumMaps } = require("../enums/enumMaps");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "resultRanked";

const PlayerSchema = new mongoose.Schema({
  userId: { type: ObjectId },
  userName: { type: String, trim: true },
  avatar: { type: String, trim: true },

  discordId: { type: String, trim: true },

  score: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  flagsTouches: { type: Number, default: 0 },

  eloBefore: { type: Number, default: 1000 },
  eloAfter: { type: Number, default: 1000 },

  isReady: { type: Boolean, default: false },
  voteCancel: { type: Boolean, default: false },
  voteRed: { type: Boolean, default: false },
  voteBlue: { type: Boolean, default: false },
});

const Schema = new mongoose.Schema(
  {
    queueId: { type: ObjectId },
    numberFromQueue: { type: Number, default: 0 },
    queueName: { type: String, trim: true },

    modeId: { type: ObjectId },
    modeName: { type: String, trim: true },

    date: { type: Date, default: Date.now },
    mode: { type: String, trim: true, default: enumModes.twoVTwo },
    map: { type: String, trim: true, default: enumMaps.ctf_5 },
    scoreLimit: { type: Number, default: 1000 },
    timeLimit: { type: Number, default: 0 },
    isForfeit: { type: Boolean, default: false },

    totalTimeSeconds: { type: Number, default: 0 },
    totalTimeMinutes: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },

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

    hasBeenCanceled: { type: Boolean, default: false },

    freezed: { type: Boolean, default: false },
    freezedAt: { type: Date },

    hasBeenVoted: { type: Boolean, default: false },
    hasBeenVotedAt: { type: Date },

    // Discord
    guildId: { type: String, trim: true },
    categoryQueueId: { type: String, trim: true },
    textChannelDisplayFinalResultId: { type: String, trim: true },
    textChannelDisplayResultId: { type: String, trim: true },
    messageReadyId: { type: String, trim: true },
    messageResultId: { type: String, trim: true },
    readyButtonId: { type: String, trim: true },
    voiceRedChannelId: { type: String, trim: true },
    voiceBlueChannelId: { type: String, trim: true },
    voteCancelButtonId: { type: String, trim: true },
    voteRedButtonId: { type: String, trim: true },
    voteBlueButtonId: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    date: this.date,
    numberFromQueue: this.numberFromQueue,
    queueName: this.queueName,
    mode: this.mode,
    map: this.map,
    scoreLimit: this.scoreLimit,
    timeLimit: this.timeLimit,
    isForfeit: this.isForfeit,
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
