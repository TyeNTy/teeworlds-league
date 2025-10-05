const express = require("express");
const router = express.Router();
const passport = require("passport");

const StatRankedModel = require("../models/statRanked");
const UserModel = require("../models/user");
const ModeModel = require("../models/mode");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors } = require("../utils");
const { updateStatPlayerRanked } = require("../utils/resultRanked");

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const stat = await StatRankedModel.findById(req.params.id);
    return res.status(200).send({ ok: true, data: stat });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body._id) obj._id = body._id;
    if (body.userName) obj.userName = { $regex: body.userName, $options: "i" };
    if (body.clanName) obj.clanName = { $regex: body.clanName, $options: "i" };
    if (body.modeId) obj.modeId = body.modeId;

    let order = -1;
    if (body.asc) order = 1;

    let sort = {};
    if (body.sort) sort[body.sort] = order;

    const stats = await StatRankedModel.find(obj).sort(sort).collation({ locale: "en", caseLevel: true });
    return res.status(200).send({ ok: true, data: stats });
  }),
);

router.post(
  "/updateStatPlayer/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const stat = await StatRankedModel.findById(id);
    if (!stat) return res.status(400).send({ ok: false, message: "Stat not found" });

    const mode = await ModeModel.findById(stat.modeId);
    if (!mode) return res.status(400).send({ ok: false, message: "Mode not found" });

    const player = await UserModel.findById(stat.userId);
    if (!player) return res.status(400).send({ ok: false, message: "Player not found" });

    const newStat = await updateStatPlayerRanked({ player, mode });

    return res.status(200).send({ ok: true, data: newStat });
  }),
);

module.exports = router;
