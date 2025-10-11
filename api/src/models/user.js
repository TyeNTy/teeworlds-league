const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const enumUserRole = require("../enums/enumUserRole");
const ObjectId = mongoose.Types.ObjectId;

const MODELNAME = "user";
const Schema = new mongoose.Schema(
  {
    userName: { type: String, trim: true },

    email: { type: String, trim: true },

    role: { type: String, enum: enumUserRole, default: enumUserRole.USER },

    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },

    elo: { type: Number, default: 1000 },

    password: { type: String },
    blocked: { type: Boolean, default: false },

    clanId: { type: ObjectId },
    clanName: { type: String },

    discordId: { type: String },

    lastLoginAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

Schema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password || "");
};

Schema.methods.responseModel = function () {
  return {
    _id: this._id,
    userName: this.userName,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    blocked: this.blocked,
    clanId: this.clanId,
    clanName: this.clanName,
    elo: this.elo,
    lastLoginAt: this.lastLoginAt,
    deletedAt: this.deletedAt,
  };
};

Schema.methods.responseMinimalModel = function () {
  return {
    _id: this._id,
    userName: this.userName,
    avatar: this.avatar,
    clanId: this.clanId,
    clanName: this.clanName,
    elo: this.elo,
  };
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
