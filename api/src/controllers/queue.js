const express = require("express");
const router = express.Router();
const passport = require("passport");

const QueueModel = require("../models/queue");
const ModeModel = require("../models/mode");
const enumUserRole = require("../enums/enumUserRole");
const { catchErrors } = require("../utils");
const { enumNumberOfPlayersPerTeam, enumNumberOfPlayersForGame, enumModes } = require("../enums/enumModes");
const discordService = require("../services/discordService");
const { join, leave } = require("../utils/resultRanked");
const { discordMessageQueue } = require("../utils/discordMessages");

const createNewQueue = async ({ queue }) => {
  const resCreateCategoryQueue = await discordService.createCategory({ guildId: queue.guildId, name: queue.name });
  if (!resCreateCategoryQueue.ok) return resCreateCategoryQueue;

  const resCreateTextChannelDisplayQueue = await discordService.createTextChannel({
    guildId: queue.guildId,
    name: queue.name + " - Queue",
    categoryId: resCreateCategoryQueue.data.category.id,
  });
  if (!resCreateTextChannelDisplayQueue.ok) return resCreateTextChannelDisplayQueue;

  const resCreateTextChannelDisplayResults = await discordService.createTextChannel({
    guildId: queue.guildId,
    name: queue.name + " - Results",
    categoryId: resCreateCategoryQueue.data.category.id,
  });
  if (!resCreateTextChannelDisplayResults.ok) return resCreateTextChannelDisplayResults;

  queue.categoryQueueId = resCreateCategoryQueue.data.category.id;
  queue.textChannelDisplayQueueId = resCreateTextChannelDisplayQueue.data.channel.id;
  queue.textChannelDisplayResultsId = resCreateTextChannelDisplayResults.data.channel.id;

  const discordMessage = await discordMessageQueue({ queue });
  const resSendMessage = await discordService.sendMessage({
    channelId: queue.textChannelDisplayQueueId,
    ...discordMessage,
  });

  queue.messageQueueId = resSendMessage.data.message.id;

  await queue.save();

  return { ok: true };
};

const updateQueue = async ({ queue }) => {
  if (!queue.guildId) return { ok: true };

  const resUpdateCategoryQueue = await discordService.updateCategory({ categoryId: queue.categoryQueueId, name: queue.name });
  if (!resUpdateCategoryQueue.ok) return resUpdateCategoryQueue;
  const resUpdateTextChannelDisplayQueue = await discordService.updateChannel({
    channelId: queue.textChannelDisplayQueueId,
    name: queue.name + " - Queue",
  });
  if (!resUpdateTextChannelDisplayQueue.ok) return resUpdateTextChannelDisplayQueue;
  const resUpdateTextChannelDisplayResults = await discordService.updateChannel({
    channelId: queue.textChannelDisplayResultsId,
    name: queue.name + " - Results",
  });
  if (!resUpdateTextChannelDisplayResults.ok) return resUpdateTextChannelDisplayResults;

  const discordMessage = await discordMessageQueue({ queue });
  await discordService.updateMessage({
    channelId: queue.textChannelDisplayQueueId,
    messageId: queue.messageQueueId,
    ...discordMessage,
  });

  return { ok: true };
};

const deleteQueue = async ({ queue }) => {
  if (!queue.guildId) return { ok: true };

  const resDeleteTextChannelDisplayQueue = await discordService.deleteChannel({ channelId: queue.textChannelDisplayQueueId });
  if (!resDeleteTextChannelDisplayQueue.ok) return resDeleteTextChannelDisplayQueue;
  queue.textChannelDisplayQueueId = null;

  const resDeleteTextChannelDisplayResults = await discordService.deleteChannel({ channelId: queue.textChannelDisplayResultsId });
  if (!resDeleteTextChannelDisplayResults.ok) return resDeleteTextChannelDisplayResults;
  queue.textChannelDisplayResultsId = null;

  const resDeleteCategoryQueue = await discordService.deleteCategory({ categoryId: queue.categoryQueueId });
  if (!resDeleteCategoryQueue.ok) return resDeleteCategoryQueue;
  queue.categoryQueueId = null;

  discordService.unregisterButtonCallback(queue.joinButtonId);
  discordService.unregisterButtonCallback(queue.leaveButtonId);

  queue.joinButtonId = null;
  queue.leaveButtonId = null;
  queue.messageQueueId = null;

  await queue.save();

  return { ok: true };
};

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {
      mode: enumModes.twoVTwo,
      numberOfPlayersPerTeam: enumNumberOfPlayersPerTeam[enumModes.twoVTwo],
      numberOfPlayersForGame: enumNumberOfPlayersForGame[enumModes.twoVTwo],
    };

    if (body.maps) obj.maps = body.maps;
    if (body.mode) {
      obj.mode = body.mode;
      obj.numberOfPlayersPerTeam = enumNumberOfPlayersPerTeam[body.mode];
      obj.numberOfPlayersForGame = enumNumberOfPlayersForGame[body.mode];
    }
    if (body.name) obj.name = body.name;

    const defaultMode = await ModeModel.findOne({});
    if (!defaultMode) return res.status(400).send({ ok: false, message: "Default mode not found" });
    obj.modeId = defaultMode._id;
    obj.modeName = defaultMode.name;

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
    const resJoin = await join({ queue, user });
    if (!resJoin.ok) return res.status(500).send(resJoin);

    if (queue.guildId) {
      const discordMessage = await discordMessageQueue({ queue });
      await discordService.updateMessage({
        channelId: queue.textChannelDisplayQueueId,
        messageId: queue.messageQueueId,
        ...discordMessage,
      });
    }

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
    const resLeave = await leave({ queue, user });
    if (!resLeave.ok) return res.status(500).send(resLeave);

    if (queue.guildId) {
      const discordMessage = await discordMessageQueue({ queue });
      await discordService.updateMessage({
        channelId: queue.textChannelDisplayQueueId,
        messageId: queue.messageQueueId,
        ...discordMessage,
      });
    }

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

    const queue = await QueueModel.findById(id);
    if (!queue) return res.status(400).send({ ok: false, error: "Queue not found" });

    const objUpdate = {};
    if (body.name) objUpdate.name = body.name;
    if (body.maps) objUpdate.maps = body.maps;
    if (body.mode) {
      objUpdate.mode = body.mode;
    }
    if (body.numberOfPlayersPerTeam) {
      objUpdate.numberOfPlayersPerTeam = body.numberOfPlayersPerTeam;
    }
    if (body.numberOfPlayersForGame) {
      objUpdate.numberOfPlayersForGame = body.numberOfPlayersForGame;
    }
    if (body.modeId) {
      const mode = await ModeModel.findById(body.modeId);
      if (!mode) return res.status(400).send({ ok: false, message: "Mode not found" });

      objUpdate.modeId = mode._id;
      objUpdate.modeName = mode.name;
    }

    queue.set(objUpdate);
    await queue.save();

    const resUpdateQueue = await updateQueue({ queue });
    if (!resUpdateQueue.ok) return res.status(500).send(resUpdateQueue);

    await queue.save();

    if (!resUpdateQueue.ok) return res.status(500).send(resUpdateQueue);

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const queue = await QueueModel.findById(id);
    if (!queue) return res.status(400).send({ ok: false, error: "Queue not found" });

    const resDeleteQueue = await deleteQueue({ queue });
    if (!resDeleteQueue.ok) return res.status(500).send(resDeleteQueue);

    await queue.deleteOne();

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

    queue.guildId = guildId;

    const resCreateNewQueue = await createNewQueue({ queue });
    if (!resCreateNewQueue.ok) return res.status(500).send(resCreateNewQueue);

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

module.exports = router;
