const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "season";

const Schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isLastSeason: { type: Boolean, default: false },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    classementClans: { type: [ObjectId], default: [] },
    classementPlayers: { type: [ObjectId], default: [] },
  },
  {
    timestamps: true,
  },
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
