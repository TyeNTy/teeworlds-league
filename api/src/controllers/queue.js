const express = require("express");
const router = express.Router();
const passport = require("passport");

const StatModel = require("../models/stat");
const UserModel = require("../models/user");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");

router.post(
  "/:create",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};

    if (body.maps) obj.maps = body.maps;
    if (body.mode) obj.mode = body.mode;

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
  "/:join",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    await QueueModel.findByIdAndUpdate(id, { $push: { players: req.user._id } });

    return res.status(200).send({ ok: true });
  }),
);

router.post(
  "/:leave",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    await QueueModel.findByIdAndUpdate(id, { $pull: { players: req.user._id } });

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
