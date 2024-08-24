const express = require("express");
const router = express.Router();
const passport = require("passport");

const StatModel = require("../models/stat");
const UserModel = require("../models/user");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const stat = await StatModel.findById(req.params.id);
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

    let order = -1;
    if (body.asc) order = 1;

    let sort = {};
    if (body.sort) sort[body.sort] = order;

    const stats = await StatModel.find(obj).sort(sort).collation({ locale: "en", caseLevel: true });
    return res.status(200).send({ ok: true, data: stats });
  }),
);

router.post(
  "/updateStatPlayer/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const player = await UserModel.findById(id);
    const stat = await updateStatPlayer(player);

    return res.status(200).send({ ok: true, data: stat });
  }),
);

module.exports = router;
