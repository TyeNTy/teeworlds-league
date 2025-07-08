
const mongoose = require("mongoose");
const enumVoteType = require("../enums/enumVote");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "vote";

const SingleVoteSchema = new mongoose.Schema({
  voterId: { type: ObjectId },
  voterName: { type: String },

  playerId: { type: ObjectId },
  playerName: { type: String },

  clanId: { type: ObjectId },
  clanName: { type: String },
});

SingleVoteSchema.methods.responseModel = function () {
  return {
    voterId: this.voterId,
    voterName: this.voterName,
    playerId: this.playerId,
    playerName: this.playerName,
    clanId: this.clanId,
    clanName: this.clanName,
  };
};

const Schema = new mongoose.Schema(
  {
    seasonId: { type: ObjectId },
    seasonName: { type: String },
    seasonStartDate: { type: Date },
    seasonEndDate: { type: Date },

    question: { type: String },

    type: { type: String, enum: enumVoteType },
    maxVotes: { type: Number },

    startDate: { type: Date },
    endDate: { type: Date },

    votes: { type: [SingleVoteSchema] },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    seasonId: this.seasonId,
    seasonName: this.seasonName,
    seasonStartDate: this.seasonStartDate,
    seasonEndDate: this.seasonEndDate,
    question: this.question,
    type: this.type,
    maxVotes: this.maxVotes,
    startDate: this.startDate,
    endDate: this.endDate,
    votes: this.votes.map((v) => v.responseModel()),
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
