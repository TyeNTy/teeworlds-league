const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const discordService = require("../services/discordService");

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

const join = async ({ queue, user }) => {
  if (!queue) return { ok: false, message: "Queue not found" };
  if (queue.players.some((player) => player.userId.toString() === user._id.toString())) return { ok: false, message: "Player already in queue" };

  const resultRanked = await ResultRankedModel.findOne({
    freezed: false,
    $or: [{ "redPlayers.userId": user._id }, { "bluePlayers.userId": user._id }],
  });
  if (resultRanked) return { ok: false, message: "You are already in a game" };

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

  return { ok: true, data: { queue, user } };
};

const leave = async ({ queue, user }) => {
  if (!queue) return { ok: false, message: "Queue not found" };
  if (!queue.players.some((player) => player.userId.toString() === user._id.toString())) return { ok: false, message: "Player not in queue" };

  queue.players = queue.players.filter((player) => player.userId.toString() !== user._id.toString());
  await queue.save();

  return { ok: true, data: { queue, user } };
};

const createGameFromQueue = async ({ queue }) => {
  const players = queue.players;
  if (players.length < queue.numberOfPlayersForGame) return { ok: false, message: "Not enough players in queue" };

  const { bluePlayers, redPlayers } = choosePlayers(queue);

  const blueRealPlayers = await UserModel.find({ _id: { $in: bluePlayers.map((player) => player.userId) } });
  const redRealPlayers = await UserModel.find({ _id: { $in: redPlayers.map((player) => player.userId) } });

  const bluePlayersObj = blueRealPlayers.map((player) => ({
    userId: player._id,
    userName: player.userName,
    avatar: player.avatar,
    eloBefore: player.eloRanked,
  }));
  const redPlayersObj = redRealPlayers.map((player) => ({
    userId: player._id,
    userName: player.userName,
    avatar: player.avatar,
    eloBefore: player.eloRanked,
  }));

  const newResultRankedObj = {
    queueId: queue._id,
    numberFromQueue: queue.numberOfGames,
    queueName: queue.name,

    bluePlayers: bluePlayersObj,
    redPlayers: redPlayersObj,

    mode: queue.mode,
    map: chooseMap(queue),

    guildId: queue.guildId,
    categoryQueueId: queue.categoryQueueId,
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

  initResultRankedMessage({ resultRanked: newResultRanked });

  return { ok: true, data: { newResultRanked, queue } };
};

const initResultRankedMessage = async ({ resultRanked }) => {
  if (!resultRanked.guildId) return { ok: true };

  if (!resultRanked.textChannelDisplayResultId) {
    const resCreateTextChannelDisplayResults = await discordService.createTextChannel({
      guildId: resultRanked.guildId,
      name: resultRanked.queueName + " - Results",
      categoryId: resultRanked.categoryQueueId,
    });

    resultRanked.textChannelDisplayResultId = resCreateTextChannelDisplayResults.data.channel.id;
  }

  if (!resultRanked.messageResultId) {
    const resCreateMessageResult = await discordService.sendMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      message: "Test result for now",
    });
    resultRanked.messageResultId = resCreateMessageResult.data.message.id;
  } else {
    const resUpdateMessageResult = await discordService.updateMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      messageId: resultRanked.messageResultId,
      message: "Test result for now",
    });
  }

  await resultRanked.save();
};

module.exports = { chooseMap, choosePlayers, join, leave, createGameFromQueue };
