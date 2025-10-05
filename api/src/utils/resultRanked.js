const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const StatRankedModel = require("../models/statRanked");
const ModeModel = require("../models/mode");
const { computeElo } = require(".");
const { detectMapFromServer } = require("./map");

/*
{
  "server": "unnamed server",
  "map": "tmp/maps-07/ctf5_spikes",
  "game_type": "gctf",
  "game_duration_seconds": 67,
  "score_limit": 200,
  "time_limit": 0,
  "score_red": 203,
  "score_blue": 0,
  "players": [
    {
      "id": 0,
      "team": "red",
      "name": "ChillerDragon",
      "score": 15,
      "kills": 3,
      "deaths": 1,
      "ratio": 3,
      "flag_grabs": 3,
      "flag_captures": 2
    },
    {
      "id": 1,
      "team": "blue",
      "name": "ChillerDragon.*",
      "score": 0,
      "kills": 0,
      "deaths": 3,
      "ratio": 0,
      "flag_grabs": 0,
      "flag_captures": 0
    }
  ]
}
*/
const parseWebhookMessage = async (content) => {
  const gameType = content.game_type;
  if (gameType !== "gctf") return { ok: false, errorCode: "INVALID_GAME_TYPE" };

  const obj = {};

  obj.date = new Date();
  obj.map = detectMapFromServer(content.map);
  obj.scoreLimit = content.score_limit;
  obj.timeLimit = content.time_limit;

  obj.redScore = content.score_red;
  obj.blueScore = content.score_blue;

  obj.totalTimeSeconds = content.game_duration_seconds % 60;
  obj.totalTimeMinutes = Math.floor(content.game_duration_seconds / 60);
  obj.totalTime = obj.totalTimeSeconds + obj.totalTimeMinutes * 60;

  const redPlayersContent = content.players.filter((player) => player.team === "red");
  const bluePlayersContent = content.players.filter((player) => player.team === "blue");

  const redPlayers = [];
  for (const player of redPlayersContent) {
    const objPlayer = {};
    const user = await UserModel.findOne({ userName: player.name });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.name } };

    objPlayer.userId = user._id;
    objPlayer.userName = player.name;
    objPlayer.avatar = user.avatar;

    objPlayer.score = player.score;
    objPlayer.kills = player.kills;
    objPlayer.deaths = player.deaths;
    objPlayer.flags = player.flag_captures;
    objPlayer.flagsTouches = player.flag_grabs;

    redPlayers.push(objPlayer);
  }
  obj.redPlayers = redPlayers;

  const bluePlayers = [];
  for (const player of bluePlayersContent) {
    const objPlayer = {};
    const user = await UserModel.findOne({ userName: player.name });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.name } };

    objPlayer.userId = user._id;
    objPlayer.userName = player.name;
    objPlayer.avatar = user.avatar;

    objPlayer.score = player.score;
    objPlayer.kills = player.kills;
    objPlayer.deaths = player.deaths;
    objPlayer.flags = player.flag_captures;
    objPlayer.flagsTouches = player.flag_grabs;

    bluePlayers.push(objPlayer);
  }
  obj.bluePlayers = bluePlayers;

  obj.mode = `${redPlayers.length}v${bluePlayers.length}`;

  const resultRanked = await ResultRankedModel.findOne({
    map: obj.map,
    mode: obj.mode,
    redPlayers: { $elemMatch: { userName: redPlayers.map((player) => player.userName) } },
    bluePlayers: { $elemMatch: { userName: bluePlayers.map((player) => player.userName) } },
    freezed: false,
  });
  if (!resultRanked) return { ok: false, errorCode: "RESULT_RANKED_NOT_FOUND" };

  for (const player of redPlayers) {
    player.eloBefore = resultRanked.redPlayers.find((p) => p.userId.toString() === player.userId.toString()).eloBefore;
  }

  for (const player of bluePlayers) {
    player.eloBefore = resultRanked.bluePlayers.find((p) => p.userId.toString() === player.userId.toString()).eloBefore;
  }

  resultRanked.set({
    ...obj,
    redPlayers,
    bluePlayers,
  });

  await resultRanked.save();

  return { ok: true, data: { resultRanked } };
};

async function forfeitResultRanked(resultRanked, side) {
  resultRanked.isForfeit = true;

  if (side === "red") {
    resultRanked.winnerName = "Blue";
    resultRanked.winnerSide = "blue";

    resultRanked.looserName = "Red";
    resultRanked.looserSide = "red";
  }

  if (side === "blue") {
    resultRanked.winnerName = "Red";
    resultRanked.winnerSide = "red";

    resultRanked.looserName = "Blue";
    resultRanked.looserSide = "blue";
  }

  await resultRanked.save();
}

async function unforfeitResultRanked(resultRanked) {
  resultRanked.isForfeit = false;

  resultRanked.winnerName = null;
  resultRanked.winnerSide = null;

  resultRanked.looserName = null;
  resultRanked.looserSide = null;

  await resultRanked.save();
}

async function updateAllStatsResultRanked(resultRanked) {
  const mode = await ModeModel.findById(resultRanked.modeId);
  if (!mode) return { ok: false, errorCode: "MODE_NOT_FOUND" };

  await updateStatResultRanked(resultRanked);

  await computeEloResultRanked(resultRanked);

  const allPlayers = resultRanked.redPlayers.concat(resultRanked.bluePlayers);
  const users = await UserModel.find({ _id: { $in: allPlayers.map((p) => p.userId) } });
  for (const user of users) await updateStatPlayerRanked({ player: user, mode });
}

async function updateStatResultRanked(resultRanked) {
  resultRanked.totalTime = resultRanked.totalTimeMinutes * 60 + resultRanked.totalTimeSeconds;

  if (resultRanked.isForfeit) {
    await resultRanked.save();
    return;
  }

  if (resultRanked.redScore > resultRanked.blueScore) {
    resultRanked.winnerName = "Red";
    resultRanked.winnerSide = "red";

    resultRanked.looserName = "Blue";
    resultRanked.looserSide = "blue";
  } else if (resultRanked.redScore < resultRanked.blueScore) {
    resultRanked.winnerName = "Blue";
    resultRanked.winnerSide = "blue";

    resultRanked.looserName = "Red";
    resultRanked.looserSide = "red";
  } else {
    resultRanked.winnerName = null;
    resultRanked.winnerSide = null;

    resultRanked.looserName = null;
    resultRanked.looserSide = null;
  }

  resultRanked.mode = `${resultRanked.redPlayers.length}v${resultRanked.bluePlayers.length}`;

  await resultRanked.save();
}

async function updateStatPlayerRanked({ player, mode }) {
  const redResultsRanked = await ResultRankedModel.find({ redPlayers: { $elemMatch: { userId: player._id } }, freezed: true, modeId: mode._id });
  const blueResultsRanked = await ResultRankedModel.find({ bluePlayers: { $elemMatch: { userId: player._id } }, freezed: true, modeId: mode._id });
  const allResultsRanked = [...redResultsRanked, ...blueResultsRanked];

  const numberGames = allResultsRanked.length;
  const redTotalScore = redResultsRanked.reduce((acc, result) => {
    const playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.score;
  }, 0);
  const blueTotalScore = blueResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.score;
  }, 0);
  const totalScore = redTotalScore + blueTotalScore;
  let averageScore = totalScore / numberGames;

  const redTotalKills = redResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.kills;
  }, 0);
  const blueTotalKills = blueResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.kills;
  }, 0);
  const totalKills = redTotalKills + blueTotalKills;
  let averageKills = totalKills / numberGames;

  const redTotalDeaths = redResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.deaths;
  }, 0);
  const blueTotalDeaths = blueResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.deaths;
  }, 0);
  const totalDeaths = redTotalDeaths + blueTotalDeaths;
  let averageDeaths = totalDeaths / numberGames;

  const redTotalFlags = redResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.flags;
  }, 0);
  const blueTotalFlags = blueResultsRanked.reduce((acc, result) => {
    const playerResultRanked = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResultRanked.flags;
  }, 0);
  const totalFlags = redTotalFlags + blueTotalFlags;
  let averageFlags = totalFlags / numberGames;

  let redKdRatio = redTotalKills / redTotalDeaths;
  let blueKdRatio = blueTotalKills / blueTotalDeaths;
  let kdRatio = totalKills / totalDeaths;

  const redWins = redResultsRanked.filter((result) => result.winnerSide === "red");
  const blueWins = blueResultsRanked.filter((result) => result.winnerSide === "blue");
  const allWins = [...redWins, ...blueWins];

  const numberRedWins = redWins.length;
  const numberBlueWins = blueWins.length;
  const numberWins = numberRedWins + numberBlueWins;

  const numberRedLosses = redResultsRanked.filter((result) => result.winnerSide === "blue").length;
  const numberBlueLosses = blueResultsRanked.filter((result) => result.winnerSide === "red").length;
  const numberLosses = numberRedLosses + numberBlueLosses;

  let averageRedTeamScore = redTotalScore / redResultsRanked.length;
  let averageBlueTeamScore = blueTotalScore / blueResultsRanked.length;

  const winningTotalScore = allWins.reduce((acc, result) => {
    if (result.winnerSide === "red") return acc + result.redScore;
    return acc + result.blueScore;
  }, 0);
  const losingTotalScore = allWins.reduce((acc, result) => {
    if (result.winnerSide === "red") return acc + result.blueScore;
    return acc + result.redScore;
  }, 0);
  let averageWinningScore = winningTotalScore / numberWins;
  let averageLosingScore = losingTotalScore / numberLosses;

  let redWinRate = numberRedWins / redResultsRanked.length;
  let blueWinRate = numberBlueWins / blueResultsRanked.length;
  let winRate = numberWins / numberGames;

  let highestScore = 0;
  let highestScoreResultId = null;
  let highestKills = 0;
  let highestKillResultId = null;
  let highestDeaths = 0;
  let highestDeathResultId = null;
  let highestFlags = 0;
  let highestFlagResultId = null;
  let highestKdRatio = 0;
  let highestKdRatioResultId = null;
  let highestRedTeamScore = 0;
  let highestRedTeamScoreResultId = null;
  let highestBlueTeamScore = 0;
  let highestBlueTeamScoreResultId = null;

  for (const result of allResultsRanked) {
    let playerResultRanked = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());

    if (!playerResultRanked) {
      playerResultRanked = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    }

    if (playerResultRanked.score > highestScore) {
      highestScore = playerResultRanked.score;
      highestScoreResultId = result._id;
    }
    if (playerResultRanked.kills > highestKills) {
      highestKills = playerResultRanked.kills;
      highestKillResultId = result._id;
    }
    if (playerResultRanked.deaths > highestDeaths) {
      highestDeaths = playerResultRanked.deaths;
      highestDeathResultId = result._id;
    }
    if (playerResultRanked.flags > highestFlags) {
      highestFlags = playerResultRanked.flags;
      highestFlagResultId = result._id;
    }
    if (playerResultRanked.kills / playerResultRanked.deaths > highestKdRatio) {
      highestKdRatio = playerResultRanked.kills / playerResultRanked.deaths;
      highestKdRatioResultId = result._id;
    }
  }

  for (const result of redResultsRanked) {
    if (result.redScore > highestRedTeamScore) {
      highestRedTeamScore = result.redScore;
      highestRedTeamScoreResultId = result._id;
    }
  }

  for (const result of blueResultsRanked) {
    if (result.blueScore > highestBlueTeamScore) {
      highestBlueTeamScore = result.blueScore;
      highestBlueTeamScoreResultId = result._id;
    }
  }

  let statRanked = await StatRankedModel.findOne({ userId: player._id, modeId: mode._id });

  if (!statRanked) {
    statRanked = new StatRankedModel({
      userId: player._id,
      elo: player.elo,

      modeId: mode._id,
      modeName: mode.name,
    });
  }

  if (isNaN(redWinRate)) redWinRate = 0;
  if (redWinRate === Infinity) redWinRate = 0;
  if (isNaN(blueWinRate)) blueWinRate = 0;
  if (blueWinRate === Infinity) blueWinRate = 0;
  if (isNaN(winRate)) winRate = 0;
  if (isNaN(redKdRatio)) redKdRatio = 0;
  if (redKdRatio === Infinity) redKdRatio = 0;
  if (isNaN(blueKdRatio)) blueKdRatio = 0;
  if (blueKdRatio === Infinity) blueKdRatio = 0;
  if (isNaN(kdRatio)) kdRatio = 0;
  if (kdRatio === Infinity) kdRatio = 0;
  if (isNaN(averageScore)) averageScore = 0;
  if (isNaN(averageKills)) averageKills = 0;
  if (isNaN(averageDeaths)) averageDeaths = 0;
  if (isNaN(averageFlags)) averageFlags = 0;
  if (isNaN(highestKdRatio)) highestKdRatio = 0;
  if (highestKdRatio === Infinity) highestKdRatio = 0;
  if (isNaN(averageRedTeamScore)) averageRedTeamScore = 0;
  if (isNaN(averageBlueTeamScore)) averageBlueTeamScore = 0;
  if (isNaN(averageWinningScore)) averageWinningScore = 0;
  if (isNaN(averageLosingScore)) averageLosingScore = 0;

  statRanked.set({
    clanId: player.clanId,
    clanName: player.clanName,
    userName: player.userName,
    avatar: player.avatar,
    numberGames,
    totalScore,
    averageScore,
    redTotalScore,
    blueTotalScore,
    redTotalKills,
    blueTotalKills,
    totalKills,
    averageKills,
    redTotalDeaths,
    blueTotalDeaths,
    totalDeaths,
    averageDeaths,
    redTotalFlags,
    blueTotalFlags,
    totalFlags,
    averageFlags,
    redKdRatio,
    blueKdRatio,
    kdRatio,
    numberWins,
    numberLosses,
    winRate,
    redWinRate,
    blueWinRate,
    highestScore,
    highestScoreResultId,
    highestKills,
    highestKillResultId,
    highestDeaths,
    highestDeathResultId,
    highestFlags,
    highestFlagResultId,
    highestKdRatio,
    highestKdRatioResultId,
    averageRedTeamScore,
    highestRedTeamScore,
    highestRedTeamScoreResultId,
    averageBlueTeamScore,
    highestBlueTeamScore,
    highestBlueTeamScoreResultId,
    averageWinningScore,
    averageLosingScore,
  });

  await statRanked.save();

  return statRanked;
}

const computeEloResultRanked = async (resultRanked) => {
  if (resultRanked.freezed) return { ok: false, errorCode: "ELO_ALREADY_COMPUTED" };

  let winnerResultPlayers = [];
  let looserResultPlayers = [];
  if (resultRanked.winnerSide === "red") {
    winnerResultPlayers = resultRanked.redPlayers;
    looserResultPlayers = resultRanked.bluePlayers;
  }

  if (resultRanked.winnerSide === "blue") {
    winnerResultPlayers = resultRanked.bluePlayers;
    looserResultPlayers = resultRanked.redPlayers;
  }

  let winnerElo = 0;
  let looserElo = 0;
  for (const player of winnerResultPlayers) {
    winnerElo += player.eloBefore;
  }

  for (const player of looserResultPlayers) {
    looserElo += player.eloBefore;
  }

  let eloWinnerBefore = winnerElo / winnerResultPlayers.length;
  let eloLooserBefore = looserElo / looserResultPlayers.length;

  let { eloGain, eloLoss } = computeElo(eloWinnerBefore, eloLooserBefore);

  if (isNaN(eloGain) || isNaN(eloLoss)) {
    eloGain = 0;
    eloLoss = 0;
    eloWinnerBefore = 0;
    eloLooserBefore = 0;
  }

  if (resultRanked.winnerSide === "red") {
    resultRanked.redEloBefore = eloWinnerBefore;
    resultRanked.blueEloBefore = eloLooserBefore;
    resultRanked.redEloGain = eloGain;
    resultRanked.blueEloGain = eloLoss;
  }
  if (resultRanked.winnerSide === "blue") {
    resultRanked.blueEloBefore = eloWinnerBefore;
    resultRanked.redEloBefore = eloLooserBefore;
    resultRanked.blueEloGain = eloGain;
    resultRanked.redEloGain = eloLoss;
  }

  for (const player of winnerResultPlayers) {
    const eloAfter = player.eloBefore + eloGain;
    player.eloAfter = eloAfter;
    const statRanked = await StatRankedModel.findOne({ userId: player.userId, modeId: resultRanked.modeId });

    if (statRanked) {
      statRanked.set({ elo: eloAfter });
      await statRanked.save();
    }
  }

  for (const player of looserResultPlayers) {
    const eloAfter = player.eloBefore + eloLoss;
    player.eloAfter = eloAfter;
    const statRanked = await StatRankedModel.findOne({ userId: player.userId, modeId: resultRanked.modeId });

    if (statRanked) {
      statRanked.set({ elo: eloAfter });
      await statRanked.save();
    }
  }

  resultRanked.eloGain = eloGain;
  resultRanked.eloLoss = eloLoss;
  resultRanked.freezed = true;
  resultRanked.freezedAt = new Date();

  await resultRanked.save();

  return resultRanked;
};

module.exports = {
  forfeitResultRanked,
  unforfeitResultRanked,
  updateAllStatsResultRanked,
  updateStatResultRanked,
  updateStatPlayerRanked,
  computeEloResultRanked,
  parseWebhookMessage,
};
