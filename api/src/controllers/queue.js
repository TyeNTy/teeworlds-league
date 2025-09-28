const express = require("express");
const router = express.Router();
const passport = require("passport");

const StatModel = require("../models/stat");
const UserModel = require("../models/user");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");
const { enumNumberOfPlayersPerTeam, enumNumberOfPlayersForGame } = require("../enums/enumModes");

router.post(
  "/:create",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};

    if (body.maps) obj.maps = body.maps;
    if (body.mode) {
      obj.mode = body.mode;
      obj.numberOfPlayersPerTeam = enumNumberOfPlayersPerTeam[body.mode];
      obj.numberOfPlayersForGame = enumNumberOfPlayersForGame[body.mode];
    }
    if (body.name) obj.name = body.name;

    const queue = await QueueModel.create(obj);
    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.get(
  "/",
  catchErrors(async (req, res) => {
    const queues = await QueueModel.find();
    return res.status(200).send({ ok: true, data: queues.map((queue) => queue.responseModel()) });
  }),
);

router.post(
  "/:id/join",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const playerObj = {
      userId: user._id,
      userName: user.userName,
      avatar: user.avatar,
      clanId: user.clanId,
      clanName: user.clanName,
      elo: user.elo,
      joinedAt: new Date(),
    };

    await QueueModel.findByIdAndUpdate(id, { $push: { players: playerObj } });

    return res.status(200).send({ ok: true });
  }),
);

router.post(
  "/:id/leave",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params
    const user = req.user;

    await QueueModel.findByIdAndUpdate(id, { $pull: { players: user._id } });

    return res.status(200).send({ ok: true });
  }),
);



router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    await QueueModel.findByIdAndDelete(id);

    return res.status(200).send({ ok: true });
  }),
);



module.exports = router;
