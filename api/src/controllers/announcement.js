const express = require("express");
const router = express.Router();
const passport = require("passport");

const AnnouncementModel = require("../models/announcement");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors, updateStatPlayer } = require("../utils");

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};

    const announcements = await AnnouncementModel.find(obj).sort({ date: -1 });

    return res.status(200).send({ ok: true, data: announcements });
  }),
);

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const announcement = await AnnouncementModel.create(body);

    return res.status(200).send({ ok: true, data: announcement });
  }),
);

module.exports = router;
