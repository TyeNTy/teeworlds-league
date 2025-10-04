const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");

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
  };

  const newResultRanked = await ResultRankedModel.create(newResultRankedObj);
  console.log("New game created");
  console.log(newResultRanked);

  for (const player of bluePlayersObj) {
    queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
  }
  for (const player of redPlayersObj) {
    queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
  }

  queue.numberOfGames++;
  await queue.save();

  return { ok: true, data: { newResultRanked, queue } };
};

module.exports = { chooseMap, choosePlayers, join, leave, createGameFromQueue };
