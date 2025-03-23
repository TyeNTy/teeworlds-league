const express = require("express");
const router = express.Router();
const passport = require("passport");

const ClanModel = require("../models/clan");
const UserModel = require("../models/user");
const config = require("../config");
const enumUserRole = require("../enums/enumUserRole");
const enumErrorCode = require("../enums/enumErrorCode");
const { catchErrors, updateStatPlayer, updateAllStatsResult, updateStatClan } = require("../utils");

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const currentSeason = await SeasonModel.findOne({ isActive: true });
    if (!currentSeason) return res.status(400).send({ ok: false, message: "No active season" });

    const obj = {
      seasonId: currentSeason._id,
      seasonName: currentSeason.name,
      seasonStartDate: currentSeason.startDate,
      seasonEndDate: currentSeason.endDate,
    };
    if (body.name) obj.name = body.name;

    const clan = await ClanModel.create(obj);
    return res.status(200).send({ ok: true, data: clan.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body._id) obj._id = body._id;
    if (body.name) obj.name = body.name;
    if (body.seasonName) obj.seasonName = body.seasonName;
    if (body.seasonId) obj.seasonId = body.seasonId;
    let order = -1;
    if (body.asc) order = 1;

    let sort = {};
    if (body.sort) sort[body.sort] = order;

    const clans = await ClanModel.find(obj).sort(sort);
    return res.status(200).send({ ok: true, data: clans.map((c) => c.responseModel()) });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body.name) obj.name = body.name;

    const clan = await ClanModel.findByIdAndUpdate(req.params.id, obj, { new: true });
    return res.status(200).send({ ok: true, data: clan.responseModel() });
  }),
);

router.post(
  "/:id/updateStat",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const clan = await ClanModel.findById(id);
    await updateStatClan(clan);

    return res.status(200).send({ ok: true, data: clan.responseModel() });
  }),
);

router.put(
  "/:id/addPlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const clan = await ClanModel.findById(req.params.id);
    if (!clan) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });

    const user = await UserModel.findById(body.userId);
    if (!user) return res.status(400).send({ ok: false, code: enumErrorCode.USER_NOT_FOUND });

    const player = { userId: user._id, userName: user.userName };
    clan.players.push(player);

    user.clanId = clan._id;
    user.clanName = clan.name;

    await user.save();
    await clan.save();

    await updateStatPlayer(user);
    await updateStatClan(clan);

    return res.status(200).send({ ok: true, data: clan.responseModel() });
  }),
);

router.delete(
  "/:id/removePlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const query = req.query;

    const clan = await ClanModel.findById(req.params.id);
    if (!clan) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });

    const user = await UserModel.findById(query.userId);
    if (!user) return res.status(400).send({ ok: false, code: enumErrorCode.USER_NOT_FOUND });

    clan.players = clan.players.filter((player) => player.userId.toString() !== user._id.toString());
    user.clanId = null;
    user.clanName = null;

    await updateStatPlayer(user);
    await updateStatClan(clan);

    await user.save();
    await clan.save();
    return res.status(200).send({ ok: true, data: { clan: clan.responseModel(), player: user.responseModel() } });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const clan = await ClanModel.findById(req.params.id);

    if (!clan) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });

    const users = await UserModel.find({ clanId: clan._id });
    for (const user of users) {
      user.clanId = null;
      user.clanName = null;
      await user.save();
    }

    await ClanModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({ ok: true, data: clan.responseModel() });
  }),
);

module.exports = router;
