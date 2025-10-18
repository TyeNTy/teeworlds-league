const express = require("express");
const router = express.Router();
const passport = require("passport");
const enumUserRole = require("../enums/enumUserRole");
const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const { catchErrors, parseDiscordMessage } = require("../utils");
const {
  forfeitResultRanked,
  unforfeitResultRanked,
  updateAllStatsResultRanked,
  updateStatResultRanked,
  deleteResultRankedDiscord,
} = require("../utils/resultRanked");
const discordService = require("../services/discordService");
const { discordMessageResultRanked } = require("../utils/discordMessages");

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const resultRanked = await ResultRankedModel.findById(req.params.id);
    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const obj = {};

    const numberPerPage = req.body.numberPerPage || 50;
    const page = req.body.page || 1;

    if (req.body._id) obj._id = req.body._id;
    if (req.body.modeId) obj.modeId = req.body.modeId;

    const total = await ResultRankedModel.countDocuments(obj);
    const results = await ResultRankedModel.find(obj, null, { sort: { date: -1 }, skip: (page - 1) * numberPerPage, limit: numberPerPage });
    return res.status(200).send({ ok: true, data: { resultsRanked: results.map((result) => result.responseModel()), numberPerPage, page, total } });
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
      const obj = {};
      result = await ResultRankedModel.create(obj);
    }

    if (body.date) result.date = body.date;

    await updateStatResultRanked(result);

    return res.status(200).send({ ok: true, data: result.responseModel() });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const resultRanked = await ResultRankedModel.findById(req.params.id);
    if (!resultRanked) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_NOT_FOUND });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, code: enumErrorCode.RESULT_ELO_ALREADY_COMPUTED });

    if (body.date) resultRanked.date = body.date;
    if (body.mode) resultRanked.mode = body.mode;
    if (body.map) resultRanked.map = body.map;
    if (body.scoreLimit) resultRanked.scoreLimit = body.scoreLimit;
    if (body.timeLimit) resultRanked.timeLimit = body.timeLimit;

    if (body.totalTimeSeconds) resultRanked.totalTimeSeconds = body.totalTimeSeconds;
    if (body.totalTimeMinutes) resultRanked.totalTimeMinutes = body.totalTimeMinutes;

    if (body.blueScore) resultRanked.blueScore = body.blueScore;
    if (body.redScore) resultRanked.redScore = body.redScore;
    if (body.redPlayers) resultRanked.redPlayers = body.redPlayers;
    if (body.bluePlayers) resultRanked.bluePlayers = body.bluePlayers;

    await updateStatResultRanked(resultRanked);

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/addRedPlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    const player = await UserModel.findById(body.playerId);
    if (!player) return res.status(400).send({ ok: false, message: "Player not found" });

    if (resultRanked.redPlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, message: "Player already in red team" });

    if (resultRanked.bluePlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, message: "Player already in blue team" });

    const statRanked = await StatRankedModel.findOne({ userId: player._id, modeId: resultRanked.modeId });
    if (!statRanked) return res.status(400).send({ ok: false, message: "Stat not found" });

    resultRanked.redPlayers.push({
      userId: player._id,
      userName: player.userName,
      avatar: player.avatar,
      eloBefore: statRanked.elo,
    });
    await resultRanked.save();

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/addBluePlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    const player = await UserModel.findById(body.playerId);
    if (!player) return res.status(400).send({ ok: false, message: "Player not found" });

    const statRanked = await StatRankedModel.findOne({ userId: player._id, modeId: resultRanked.modeId });
    if (!statRanked) return res.status(400).send({ ok: false, message: "Stat not found" });

    if (resultRanked.redPlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, message: "Player already in red team" });
    if (resultRanked.bluePlayers.find((p) => p.userId.toString() === player._id.toString()))
      return res.status(400).send({ ok: false, message: "Player already in blue team" });

    resultRanked.bluePlayers.push({
      userId: player._id,
      userName: player.userName,
      avatar: player.avatar,
      eloBefore: statRanked.elo,
    });
    await resultRanked.save();

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/removePlayer",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    resultRanked.redPlayers = resultRanked.redPlayers.filter((player) => player.userId.toString() !== body.playerId);
    resultRanked.bluePlayers = resultRanked.bluePlayers.filter((player) => player.userId.toString() !== body.playerId);

    await resultRanked.save();

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/freeze",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    await updateAllStatsResultRanked(resultRanked);

    if (resultRanked.guildId) {
      await deleteResultRankedDiscord({ resultRanked });

      await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayFinalResultId,
        ...(await discordMessageResultRanked({ resultRanked })),
      });
    }

    await resultRanked.save();

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/forfeit",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    const side = body.side;

    await forfeitResultRanked(resultRanked, side);

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.post(
  "/:id/unforfeit",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    await unforfeitResultRanked(resultRanked);

    return res.status(200).send({ ok: true, data: resultRanked.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const resultRanked = await ResultRankedModel.findById(id);
    if (!resultRanked) return res.status(400).send({ ok: false, message: "Result not found" });
    if (resultRanked.freezed) return res.status(400).send({ ok: false, message: "Result already frozen" });

    const resDeleteResultRanked = await deleteResultRankedDiscord({ resultRanked });
    if (!resDeleteResultRanked.ok) return res.status(500).send(resDeleteResultRanked);

    await resultRanked.deleteOne();

    return res.status(200).send({ ok: true });
  }),
);

module.exports = router;
