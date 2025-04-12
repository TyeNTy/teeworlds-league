const express = require("express");
const router = express.Router();
const passport = require("passport");

const ClanModel = require("../models/clan");
const UserModel = require("../models/user");
const SeasonModel = require("../models/season");
const EventModel = require("../models/event");
const enumUserRole = require("../enums/enumUserRole");
const enumErrorCode = require("../enums/enumErrorCode");
const { catchErrors, updateStatPlayer, updateAllStatsResult, updateStatClan } = require("../utils");

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { body } = req;

    const obj = {};
    if (body.startDate) obj.startDate = body.startDate;
    if (body.endDate) obj.endDate = body.endDate;
    if (body.title) obj.title = body.title;

    const currentSeason = await SeasonModel.findOne({ isActive: true });
    if (!currentSeason) return res.status(400).send({ ok: false, code: enumErrorCode.INVALID_PROPERTY });

    const event = await EventModel.create({
      ...obj,
      seasonId: currentSeason._id,
      seasonName: currentSeason.name,
      seasonStartDate: currentSeason.startDate,
      seasonEndDate: currentSeason.endDate,
    });
    return res.status(200).send({ ok: true, data: event.responseModel() });
  }),
);

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const event = await EventModel.findById(req.params.id);
    if (!event) return res.status(400).send({ ok: false, code: enumErrorCode.INVALID_PROPERTY });
    return res.status(200).send({ ok: true, data: event.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body.startDate) obj.startDate = { $gte: body.startDate };
    if (body.endDate) obj.endDate = { $lte: body.endDate };

    const events = await EventModel.find(obj);
    return res.status(200).send({ ok: true, data: events.map((e) => e.responseModel()) });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body.title) obj.title = body.title;
    if (body.description) obj.description = body.description;
    if (body.clanAId) {
      const clanA = await ClanModel.findById(body.clanAId);
      if (!clanA) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });
      obj.clanAId = clanA._id;
      obj.clanAName = clanA.name;
    }
    if (body.clanBId) {
      const clanB = await ClanModel.findById(body.clanBId);
      if (!clanB) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });
      obj.clanBId = clanB._id;
      obj.clanBName = clanB.name;
    }
    if (body.startDate) obj.startDate = body.startDate;
    if (body.endDate) obj.endDate = body.endDate;
    if (body.twitch) obj.twitch = body.twitch;

    const event = await EventModel.findByIdAndUpdate(req.params.id, obj, { new: true });
    return res.status(200).send({ ok: true, data: event.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const event = await EventModel.findById(req.params.id);

    if (!event) return res.status(400).send({ ok: false, code: enumErrorCode.INVALID_PROPERTY });

    await EventModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({ ok: true });
  }),
);

module.exports = router;
