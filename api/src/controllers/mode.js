const express = require("express");
const router = express.Router();
const passport = require("passport");

const ModeModel = require("../models/mode");
const QueueModel = require("../models/queue");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");

router.get(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const stat = await ModeModel.findById(req.params.id);
    return res.status(200).send({ ok: true, data: stat });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body._id) obj._id = body._id;
    if (body.name) obj.name = { $regex: body.name, $options: "i" };

    let order = -1;
    if (body.asc) order = 1;

    let sort = {};
    if (body.sort) sort[body.sort] = order;

    const modes = await ModeModel.find(obj).sort(sort).collation({ locale: "en", caseLevel: true });
    return res.status(200).send({ ok: true, data: modes.map((mode) => mode.responseModel()) });
  }),
);

router.post(
  "/create",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const mode = await ModeModel.create({});

    return res.status(200).send({ ok: true, data: mode.responseModel() });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const mode = await ModeModel.findById(id);
    if (!mode) return res.status(400).send({ ok: false, message: "Mode not found" });

    const obj = {};
    if (body.name) obj.name = body.name;

    mode.set(obj);
    await mode.save();

    return res.status(200).send({ ok: true, data: mode.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const queue = await QueueModel.findOne({ modeId: id });
    if (queue) return res.status(400).send({ ok: false, message: "Mode is used in a queue" });

    await ModeModel.findByIdAndDelete(id);
    return res.status(200).send({ ok: true, message: "Mode deleted successfully" });
  }),
);

module.exports = router;
