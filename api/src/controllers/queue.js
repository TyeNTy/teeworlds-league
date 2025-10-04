const express = require("express");
const router = express.Router();
const passport = require("passport");

const QueueModel = require("../models/queue");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors } = require("../utils");
const { enumNumberOfPlayersPerTeam, enumNumberOfPlayersForGame } = require("../enums/enumModes");
const discordService = require("../services/discordService");
const { createNewQueue, deleteQueue, updateQueue } = require("../utils/discord");

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};

    if (body.maps) obj.maps = body.maps;
    if (body.mode) {
      obj.mode = body.mode;
      obj.numberOfPlayersPerTeam = enumNumberOfPlayersPerTeam[body.mode];
      obj.numberOfPlayersForGame = enumNumberOfPlayersForGame[body.mode];
    }
    if (body.name) obj.name = body.name;

    const queue = await QueueModel.create(obj);
    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;
    const obj = {};

    if (body._id) obj._id = body._id;

    const queues = await QueueModel.find(obj);

    return res.status(200).send({ ok: true, data: queues.map((queue) => queue.responseModel()) });
  }),
);

router.post(
  "/:id/join",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const queue = await QueueModel.findById(id);
    if (!queue) return res.status(400).send({ ok: false, message: "Queue not found" });
    if (queue.players.some((player) => player.userId === user._id)) return res.status(400).send({ ok: false, message: "Player already in queue" });

    const playerObj = {
      userId: user._id,
      userName: user.userName,
      avatar: user.avatar,
      clanId: user.clanId,
      clanName: user.clanName,
      elo: user.elo,
      joinedAt: new Date(),
    };

    queue.players.push(playerObj);
    await queue.save();

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.post(
  "/:id/leave",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const queue = await QueueModel.findById(id);
    if (!queue) return res.status(400).send({ ok: false, message: "Queue not found" });
    if (!queue.players.some((player) => player.userId.toString() === user._id.toString()))
      return res.status(400).send({ ok: false, message: "Player not in queue" });

    queue.players = queue.players.filter((player) => player.userId.toString() !== user._id.toString());
    await queue.save();

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.post(
  "/:id/discordRecreate",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const queue = await QueueModel.findById(id);
    if (!queue) return res.status(400).send({ ok: false, message: "Queue not found" });

    const resDelete = await deleteQueue({ queue });
    if (!resDelete.ok) return res.status(500).send(resDelete);

    const resCreateNewQueue = await createNewQueue({ queue });
    if (!resCreateNewQueue.ok) return res.status(500).send(resCreateNewQueue);

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const objUpdate = {};
    if (body.name) objUpdate.name = body.name;
    if (body.maps) objUpdate.maps = body.maps;
    if (body.mode) {
      objUpdate.mode = body.mode;
      objUpdate.numberOfPlayersPerTeam = enumNumberOfPlayersPerTeam[body.mode];
      objUpdate.numberOfPlayersForGame = enumNumberOfPlayersForGame[body.mode];
    }

    const queue = await QueueModel.findByIdAndUpdate(id, objUpdate);

    const resUpdateQueue = await updateQueue({ queue });
    if (!resUpdateQueue.ok) return res.status(500).send(resUpdateQueue);

    return res.status(200).send({ ok: true, data: queue.responseModel() });
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

router.put(
  "/:id/guild",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const { guildId } = req.body;

    if (!guildId) {
      return res.status(400).send({ ok: false, error: "guildId is required" });
    }

    const queue = await QueueModel.findById(id);
    if (!queue) {
      return res.status(404).send({ ok: false, error: "Queue not found" });
    }
    if (queue.guildId === guildId) {
      return res.status(200).send({ ok: true, data: queue.responseModel() });
    } else if (queue.guildId) {
      const resDeleteQueue = await deleteQueue({ queue });
      if (!resDeleteQueue.ok) return res.status(500).send(resDeleteQueue);
    }

    const resGuilds = await discordService.getGuilds();
    if (!resGuilds.ok) return res.status(500).send(resGuilds);

    const guilds = resGuilds.data.guilds;
    if (!guilds.has(guildId)) {
      return res.status(400).send({ ok: false, error: "Guild not found or bot not in guild" });
    }

    const resCreateNewQueue = await createNewQueue({ queue });
    if (!resCreateNewQueue.ok) return res.status(500).send(resCreateNewQueue);

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

module.exports = router;
