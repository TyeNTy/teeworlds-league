const express = require("express");
const router = express.Router();
const passport = require("passport");

const StatModel = require("../models/stat");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");

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

module.exports = router;
