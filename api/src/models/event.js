const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const enumUserRole = require("../enums/enumUserRole");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "event";

const Schema = new mongoose.Schema(
  {
    seasonId: { type: ObjectId },
    seasonName: { type: String },
    seasonStartDate: { type: Date },
    seasonEndDate: { type: Date },

    title: { type: String, trim: true },
    description: { type: String, trim: true },

    clanAId: { type: ObjectId },
    clanAName: { type: String, trim: true },
    clanBId: { type: ObjectId },
    clanBName: { type: String, trim: true },

    startDate: { type: Date },
    endDate: { type: Date },

    twitch: { type: String, trim: true },
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
    title: this.title,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    clanAId: this.clanAId,
    clanAName: this.clanAName,
    clanBId: this.clanBId,
    clanBName: this.clanBName,
    twitch: this.twitch,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
