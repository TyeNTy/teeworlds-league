const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const StatRankedModel = require("../models/statRanked");
const discordService = require("../services/discordService");
const { discordMessageResultRankedNotReady, discordPrivateMessageNewQueue, discordMessageQueue } = require("./discordMessages");

const createGameFromQueue = async ({ queue }) => {
  const players = queue.players;
  if (players.length < queue.numberOfPlayersForGame) return { ok: false, message: "Not enough players in queue" };

  const { bluePlayers, redPlayers } = choosePlayers(queue);

  const blueRealPlayers = await UserModel.find({ _id: { $in: bluePlayers.map((player) => player.userId) } });
  const redRealPlayers = await UserModel.find({ _id: { $in: redPlayers.map((player) => player.userId) } });

  const bluePlayersObj = await Promise.all(
    blueRealPlayers.map(async (player) => {
      let statRanked = await StatRankedModel.findOne({ userId: player._id, modeId: queue.modeId });

      if (!statRanked) {
        statRanked = await StatRankedModel.create({
          userId: player._id,
          elo: player.elo,

          modeId: queue.modeId,
          modeName: queue.modeName,
        });
      }

      return {
        userId: player._id,
        userName: player.userName,
        avatar: player.avatar,
        eloBefore: statRanked.elo,
        discordId: player.discordId,
      };
    }),
  );
  const redPlayersObj = await Promise.all(
    redRealPlayers.map(async (player) => {
      let statRanked = await StatRankedModel.findOne({ userId: player._id, modeId: queue.modeId });

      if (!statRanked) {
        statRanked = await StatRankedModel.create({
          userId: player._id,
          elo: player.elo,

          modeId: queue.modeId,
          modeName: queue.modeName,
        });
      }

      return {
        userId: player._id,
        userName: player.userName,
        avatar: player.avatar,
        eloBefore: statRanked.elo,
        discordId: player.discordId,
      };
    }),
  );

  const newResultRankedObj = {
    queueId: queue._id,
    numberFromQueue: queue.numberOfGames,
    queueName: queue.name,

    modeId: queue.modeId,
    modeName: queue.modeName,

    bluePlayers: bluePlayersObj,
    redPlayers: redPlayersObj,

    mode: queue.mode,
    map: chooseMap(queue),

    guildId: queue.guildId,
    categoryQueueId: queue.categoryQueueId,
    textChannelDisplayFinalResultId: queue.textChannelDisplayResultsId,
  };

  const newResultRanked = await ResultRankedModel.create(newResultRankedObj);

  for (const player of bluePlayersObj) {
    queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
  }
  for (const player of redPlayersObj) {
    queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
  }

  queue.numberOfGames++;
  await queue.save();

  const resUpdateMessageQueue = await discordService.updateMessage({
    channelId: queue.textChannelDisplayQueueId,
    messageId: queue.messageQueueId,
    ...(await discordMessageQueue({ queue })),
  });
  if (!resUpdateMessageQueue.ok) return { ok: false, message: "Failed to update message queue" };

  const resCreateTextChannelDisplayResults = await discordService.createTextChannel({
    guildId: newResultRanked.guildId,
    name: "queue_" + newResultRanked.id.toString(),
    categoryId: newResultRanked.categoryQueueId,
  });
  newResultRanked.textChannelDisplayResultId = resCreateTextChannelDisplayResults.data.channel.id;

  const resCreateVoiceRedChannel = await discordService.createVoiceChannel({
    guildId: newResultRanked.guildId,
    name: "red_" + newResultRanked.id.toString(),
    categoryId: newResultRanked.categoryQueueId,
  });
  if (!resCreateVoiceRedChannel.ok) return { ok: false, message: "Failed to create voice channel" };
  newResultRanked.voiceRedChannelId = resCreateVoiceRedChannel.data.channel.id;

  const resCreateVoiceBlueChannel = await discordService.createVoiceChannel({
    guildId: newResultRanked.guildId,
    name: "blue_" + newResultRanked.id.toString(),
    categoryId: newResultRanked.categoryQueueId,
  });
  if (!resCreateVoiceBlueChannel.ok) return { ok: false, message: "Failed to create voice channel" };
  newResultRanked.voiceBlueChannelId = resCreateVoiceBlueChannel.data.channel.id;

  const discordMessage = await discordMessageResultRankedNotReady({ resultRanked: newResultRanked });
  const resSendMessageReady = await discordService.sendMessage({
    channelId: newResultRanked.textChannelDisplayResultId,
    ...discordMessage,
  });
  newResultRanked.messageReadyId = resSendMessageReady.data.message.id;

  for (const player of redRealPlayers) {
    if (!player.discordId) continue;
    const discordPrivateMessage = discordPrivateMessageNewQueue({ resultRanked: newResultRanked });
    await discordService.sendPrivateMessage({
      userId: player.discordId,
      ...discordPrivateMessage,
    });
  }
  for (const player of blueRealPlayers) {
    if (!player.discordId) continue;
    const discordPrivateMessage = discordPrivateMessageNewQueue({ resultRanked: newResultRanked });
    await discordService.sendPrivateMessage({
      userId: player.discordId,
      ...discordPrivateMessage,
    });
  }

  await newResultRanked.save();

  return { ok: true, data: { newResultRanked, queue } };
};

const chooseMap = (queue) => {
  return queue.maps[(Math.random() * queue.maps.length) | 0];
};

const choosePlayers = (queue) => {
  const numberOfPlayersPerTeam = queue.numberOfPlayersPerTeam;
  const numberOfPlayersForGame = queue.numberOfPlayersForGame;

  const playersToChoose = queue.players.sort((player) => player.joinedAt).slice(0, numberOfPlayersForGame);

  const playersShuffled = [...playersToChoose].sort(() => Math.random() - 0.5);

  const bluePlayers = playersShuffled.slice(0, numberOfPlayersPerTeam);
  const redPlayers = playersShuffled.slice(numberOfPlayersPerTeam, numberOfPlayersForGame);

  return { bluePlayers, redPlayers };
};

module.exports = { createGameFromQueue };
