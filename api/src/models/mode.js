const mongoose = require("mongoose");

const MODELNAME = "mode";

const Schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "gCTF 2v2" },
  },
  {
    timestamps: true,
  },
);

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    name: this.name,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
