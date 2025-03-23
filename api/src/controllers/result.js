const express = require("express");
const router = express.Router();
const passport = require("passport");

const ResultModel = require("../models/result");
const UserModel = require("../models/user");
const ClanModel = require("../models/clan");
const SeasonModel = require("../models/season");
const enumUserRole = require("../enums/enumUserRole");
const enumErrorCode = require("../enums/enumErrorCode");
const {
  catchErrors,
  updateStatResult,
  parseDiscordMessage,
  updateStatPlayer,
  updateAllStatsResult,
  forfeitResult,
  unforfeitResult,
} = require("../utils");

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

    if (body.date) obj.date = body.date;

    const result = await ResultModel.create(obj);
    await updateStatResult(result);
    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/import",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    let result;
    if (body.message) {
      const response = await parseDiscordMessage(body.message);
      if (!response.ok) return res.status(400).send(response);
      result = response.data.result;
    } else {
      const currentSeason = await SeasonModel.findOne({ isActive: true });
      if (!currentSeason) return res.status(400).send({ ok: false, message: "No active season" });

      const obj = {
        seasonId: currentSeason._id,
        seasonName: currentSeason.name,
        seasonStartDate: currentSeason.startDate,
        seasonEndDate: currentSeason.endDate,
      };
      result = await ResultModel.create(obj);
    }

    if (body.date) result.date = body.date;

    await updateStatResult(result);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/:resultId/freeze",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resultId = req.params.resultId;

    const result = await ResultModel.findById(resultId);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    await updateAllStatsResult(result);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/:resultId/forfeit",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resultId = req.params.resultId;

    const result = await ResultModel.findById(resultId);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    const body = req.body;
    const side = body.side;

    await forfeitResult(result, side);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/:resultId/unforfeit",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resultId = req.params.resultId;

    const result = await ResultModel.findById(resultId);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    await unforfeitResult(result);
    await updateStatResult(result);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body._id) obj._id = body._id;
    if (body.seasonName) obj.seasonName = body.seasonName;

    const results = await ResultModel.find(obj, null, { sort: { date: -1 } });
    return res.status(200).send({ ok: true, data: results.map((result) => result.responseModel()) });
  }),
);

router.post(
  "/:id/addRedPlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const result = await ResultModel.findById(req.params.id);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    const player = await UserModel.findById(body.playerId);
    if (!player) return res.status(400).send({ ok: false, code: enumErrorCode.USER_NOT_FOUND });

    if (result.redPlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, code: enumErrorCode.PLAYER_ALREADY_IN_TEAM });

    if (result.bluePlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, code: enumErrorCode.PLAYER_ALREADY_IN_TEAM });

    result.redPlayers.push({
      userId: player._id,
      userName: player.userName,
      avatar: player.avatar,
    });

    await result.save();

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/:id/addBluePlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const result = await ResultModel.findById(req.params.id);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    const player = await UserModel.findById(body.playerId);
    if (!player) return res.status(400).send({ ok: false, code: enumErrorCode.USER_NOT_FOUND });

    if (result.redPlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, code: enumErrorCode.PLAYER_ALREADY_IN_TEAM });

    if (result.bluePlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, code: enumErrorCode.PLAYER_ALREADY_IN_TEAM });

    result.bluePlayers.push({
      userId: player._id,
      userName: player.userName,
      avatar: player.avatar,
    });

    await result.save();

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.post(
  "/:id/removePlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const result = await ResultModel.findById(req.params.id);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    result.redPlayers = result.redPlayers.filter((p) => p.userId.toString() !== body.playerId);
    result.bluePlayers = result.bluePlayers.filter((p) => p.userId.toString() !== body.playerId);

    await result.save();

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const result = await ResultModel.findById(req.params.id);
    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    if (body.date) result.date = body.date;
    if (body.mode) result.mode = body.mode;
    if (body.map) result.map = body.map;
    if (body.scoreLimit) result.scoreLimit = body.scoreLimit;
    if (body.timeLimit) result.timeLimit = body.timeLimit;

    if (body.totalTimeSeconds) result.totalTimeSeconds = body.totalTimeSeconds;
    if (body.totalTimeMinutes) result.totalTimeMinutes = body.totalTimeMinutes;

    if (body.blueClanId) {
      const clan = await ClanModel.findById(body.blueClanId);
      if (!clan) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });
      result.blueClanId = clan._id;
      result.blueClanName = clan.name;
    }

    if (body.redClanId) {
      const clan = await ClanModel.findById(body.redClanId);
      if (!clan) return res.status(400).send({ ok: false, code: enumErrorCode.CLAN_NOT_FOUND });
      result.redClanId = clan._id;
      result.redClanName = clan.name;
    }

    if (body.blueScore) result.blueScore = body.blueScore;
    if (body.redScore) result.redScore = body.redScore;
    if (body.redPlayers) result.redPlayers = body.redPlayers;
    if (body.bluePlayers) result.bluePlayers = body.bluePlayers;

    await updateStatResult(result);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const result = await ResultModel.findById(req.params.id);

    if (!result) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (result.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    await result.deleteOne();

    for (const player of result.redPlayers) {
      const user = await UserModel.findById(player.userId);
      if (user) await updateStatPlayer(user);
    }

    for (const player of result.bluePlayers) {
      const user = await UserModel.findById(player.userId);
      if (user) await updateStatPlayer(user);
    }

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

module.exports = router;
