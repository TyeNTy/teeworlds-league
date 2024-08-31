const ResultModel = require("../models/result");
const StatModel = require("../models/stat");
const UserModel = require("../models/user");
const ClanModel = require("../models/clan");
const { enumMaps } = require("../enums/enumMaps");

// Generate a random number between 000000 and 999999 and return as string
function generateEmailcodeValidation() {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
}

function catchErrors(fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

async function updateAllStatsResult(result) {
  await updateStatResult(result);

  await computeEloResult(result);

  const allPlayers = result.redPlayers.concat(result.bluePlayers);
  const users = await UserModel.find({ _id: { $in: allPlayers.map((p) => p.userId) } });
  for (const user of users) await updateStatPlayer(user);

  await updateStatClan(await ClanModel.findById(result.redClanId));
  await updateStatClan(await ClanModel.findById(result.blueClanId));
}

async function updateStatResult(result) {
  result.totalTime = result.totalTimeMinutes * 60 + result.totalTimeSeconds;

  if (result.redScore > result.blueScore) {
    result.winnerId = result.redClanId;
    result.winnerName = result.redClanName;
    result.winnerSide = "red";

    result.looserId = result.blueClanId;
    result.looserName = result.blueClanName;
    result.looserSide = "blue";
  } else if (result.redScore < result.blueScore) {
    result.winnerId = result.blueClanId;
    result.winnerName = result.blueClanName;
    result.winnerSide = "blue";

    result.looserId = result.redClanId;
    result.looserName = result.redClanName;
    result.looserSide = "red";
  } else {
    result.winnerId = null;
    result.winnerName = null;
    result.winnerSide = null;

    result.looserId = null;
    result.looserName = null;
    result.looserSide = null;
  }

  result.mode = `${result.redPlayers.length}v${result.bluePlayers.length}`;

  await result.save();
}

async function updateStatClan(clan) {
  if (!clan) return;

  const winnerResults = await ResultModel.find({ winnerId: clan._id, freezed: true });
  const looserResults = await ResultModel.find({ looserId: clan._id, freezed: true });

  clan.numberGames = winnerResults.length + looserResults.length;
  clan.numberWins = winnerResults.length;
  clan.numberLosses = looserResults.length;

  clan.points = clan.numberWins;
  clan.difference = clan.numberWins - clan.numberLosses;

  clan.winRate = clan.numberWins / clan.numberGames;

  if (isNaN(clan.winRate)) clan.winRate = 0;

  await clan.save();
}

async function updateStatPlayer(player) {
  const redResults = await ResultModel.find({ redPlayers: { $elemMatch: { userId: player._id } }, freezed: true });
  const blueResults = await ResultModel.find({ bluePlayers: { $elemMatch: { userId: player._id } }, freezed: true });
  const allResults = [...redResults, ...blueResults];

  const numberGames = allResults.length;
  const redTotalScore = redResults.reduce((acc, result) => {
    const playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.score;
  }, 0);
  const blueTotalScore = blueResults.reduce((acc, result) => {
    const playerResult = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.score;
  }, 0);
  const totalScore = redTotalScore + blueTotalScore;
  let averageScore = totalScore / numberGames;

  const redTotalKills = redResults.reduce((acc, result) => {
    const playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.kills;
  }, 0);
  const blueTotalKills = blueResults.reduce((acc, result) => {
    const playerResult = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.kills;
  }, 0);
  const totalKills = redTotalKills + blueTotalKills;
  let averageKills = totalKills / numberGames;

  const redTotalDeaths = redResults.reduce((acc, result) => {
    const playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.deaths;
  }, 0);
  const blueTotalDeaths = blueResults.reduce((acc, result) => {
    const playerResult = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.deaths;
  }, 0);
  const totalDeaths = redTotalDeaths + blueTotalDeaths;
  let averageDeaths = totalDeaths / numberGames;

  const redTotalFlags = redResults.reduce((acc, result) => {
    const playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.flags;
  }, 0);
  const blueTotalFlags = blueResults.reduce((acc, result) => {
    const playerResult = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    return acc + playerResult.flags;
  }, 0);
  const totalFlags = redTotalFlags + blueTotalFlags;
  let averageFlags = totalFlags / numberGames;

  let redKdRatio = redTotalKills / redTotalDeaths;
  let blueKdRatio = blueTotalKills / blueTotalDeaths;
  let kdRatio = totalKills / totalDeaths;

  const redWins = redResults.filter((result) => result.winnerSide === "red");
  const blueWins = blueResults.filter((result) => result.winnerSide === "blue");
  const allWins = [...redWins, ...blueWins];

  const numberRedWins = redWins.length;
  const numberBlueWins = blueWins.length;
  const numberWins = numberRedWins + numberBlueWins;

  const numberRedLosses = redResults.filter((result) => result.winnerSide === "blue").length;
  const numberBlueLosses = blueResults.filter((result) => result.winnerSide === "red").length;
  const numberLosses = numberRedLosses + numberBlueLosses;

  let averageRedTeamScore = redTotalScore / redResults.length;
  let averageBlueTeamScore = blueTotalScore / blueResults.length;

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

  let redWinRate = numberRedWins / redResults.length;
  let blueWinRate = numberBlueWins / blueResults.length;
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

  for (const result of allResults) {
    let playerResult = result.redPlayers.find((p) => p.userId.toString() === player._id.toString());

    if (!playerResult) {
      playerResult = result.bluePlayers.find((p) => p.userId.toString() === player._id.toString());
    }

    if (playerResult.score > highestScore) {
      highestScore = playerResult.score;
      highestScoreResultId = result._id;
    }
    if (playerResult.kills > highestKills) {
      highestKills = playerResult.kills;
      highestKillResultId = result._id;
    }
    if (playerResult.deaths > highestDeaths) {
      highestDeaths = playerResult.deaths;
      highestDeathResultId = result._id;
    }
    if (playerResult.flags > highestFlags) {
      highestFlags = playerResult.flags;
      highestFlagResultId = result._id;
    }
    if (playerResult.kills / playerResult.deaths > highestKdRatio) {
      highestKdRatio = playerResult.kills / playerResult.deaths;
      highestKdRatioResultId = result._id;
    }
    if (result.redScore > highestRedTeamScore) {
      highestRedTeamScore = result.redScore;
      highestRedTeamScoreResultId = result._id;
    }
    if (result.blueScore > highestBlueTeamScore) {
      highestBlueTeamScore = result.blueScore;
      highestBlueTeamScoreResultId = result._id;
    }
  }

  let stat = await StatModel.findOne({ userId: player._id });

  if (!stat) {
    stat = new StatModel({
      userId: player._id,
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

  stat.set({
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

  await stat.save();

  return stat;
}

function detectMap(mapString) {
  const mapName = mapString.split("/").pop();
  const foundMap = enumMaps.find((map) => map.label === mapName);
  return foundMap ? foundMap.value : null;
}

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

  const server = content.server;
  if (server !== "gCTF League Test Server") return { ok: false, errorCode: "INVALID_SERVER" };

  const obj = {};

  obj.date = new Date();
  obj.map = detectMap(content.map);
  obj.scoreLimit = content.score_limit;
  obj.timeLimit = content.time_limit;

  obj.redScore = content.score_red;
  obj.blueScore = content.score_blue;

  const redPlayersContent = content.players.filter((player) => player.team === "red");
  const bluePlayersContent = content.players.filter((player) => player.team === "blue");

  const redPlayers = [];
  let redClanName;
  for (const player of redPlayersContent) {
    const objPlayer = {};
    const user = await UserModel.findOne({ userName: player.name });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.name } };

    if (redClanName === undefined) redClanName = user.clanName;
    if (user.clanName !== redClanName)
      return {
        ok: false,
        errorCode: "CLAN_NAME_MISMATCH",
        errorData: { userName: player.userName, clanNameReal: redClanName, clanName: user.clanName },
      };

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
  let blueClanName;
  for (const player of bluePlayersContent) {
    const objPlayer = {};
    const user = await UserModel.findOne({ userName: player.name });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.name } };

    if (blueClanName === undefined) blueClanName = user.clanName;
    if (!user.clanName)
      return {
        ok: false,
        errorCode: "CLAN_NAME_MISMATCH",
        errorData: { userName: player.name, clanNameReal: blueClanName, clanName: user.clanName },
      };

    objPlayer.userId = user._id;
    objPlayer.userName = player.name;
    objPlayer.avatar = user.avatar;

    objPlayer.score = player.score;
    objPlayer.kills = player.kills;
    objPlayer.deaths = player.deaths;
    objPlayer.flags = 0; // TODO: add flags

    bluePlayers.push(objPlayer);
  }
  obj.bluePlayers = bluePlayers;

  if (redClanName === blueClanName) return { ok: false, errorCode: "SAME_CLAN", errorData: { clanName: redClanName } };

  const redClan = await ClanModel.findOne({ name: redClanName });
  if (!redClan) return { ok: false, errorCode: "CLAN_NOT_FOUND", errorData: { clanName: redClanName } };
  const blueClan = await ClanModel.findOne({ name: blueClanName });
  if (!blueClan) return { ok: false, errorCode: "CLAN_NOT_FOUND", errorData: { clanName: blueClanName } };

  obj.redClanId = redClan._id;
  obj.redClanName = redClanName;
  obj.blueClanId = blueClan._id;
  obj.blueClanName = blueClanName;

  obj.mode = `${redPlayers.length}v${bluePlayers.length}`;

  const result = await ResultModel.create(obj);

  return { ok: true, data: { result } };
};

const parseDiscordMessage = async (content) => {
  const lines = content.split("\n");

  const serverInfo = parseServerInfo(lines[0], lines[1]);

  const redTeamStartIndex = lines.findIndex((line) => line.startsWith("Red Team:"));
  const blueTeamStartIndex = lines.findIndex((line) => line.startsWith("Blue Team:"));

  const redPlayers = parseTeamPlayers(lines.slice(redTeamStartIndex + 1, blueTeamStartIndex));
  const bluePlayers = parseTeamPlayers(lines.slice(blueTeamStartIndex + 1));

  if (redPlayers.length !== bluePlayers.length) return { ok: false, errorCode: "TEAM_SIZE_MISMATCH" };
  const mode = `${redPlayers.length}v${bluePlayers.length}`;

  const lastLine = lines[lines.length - 1];
  const redScore = parseInt(/Red: (\d+)/.exec(lastLine)[1]);
  const blueScore = parseInt(/Blue (\d+)/.exec(lastLine)[1]);

  let redClanName;
  for (const player of redPlayers) {
    const user = await UserModel.findOne({ userName: player.userName });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.userName } };

    if (redClanName === undefined) redClanName = user.clanName;
    if (user.clanName !== redClanName)
      return {
        ok: false,
        errorCode: "CLAN_NAME_MISMATCH",
        errorData: { userName: player.userName, clanNameReal: redClanName, clanName: user.clanName },
      };

    player.userId = user._id;
    player.avatar = user.avatar;
  }

  let blueClanName;
  for (const player of bluePlayers) {
    const user = await UserModel.findOne({ userName: player.userName });
    if (!user) return { ok: false, errorCode: "PLAYER_NOT_FOUND", errorData: { userName: player.userName } };

    if (blueClanName === undefined) blueClanName = user.clanName;
    if (!user.clanName) return { ok: false, errorCode: "PLAYER_NOT_IN_CLAN", errorData: { userName: player.userName } };
    if (user.clanName !== blueClanName)
      return {
        ok: false,
        errorCode: "CLAN_NAME_MISMATCH",
        errorData: { userName: player.userName, clanNameReal: blueClanName, clanName: user.clanName },
      };

    player.userId = user._id;
    player.avatar = user.avatar;
  }

  if (redClanName === blueClanName) return { ok: false, errorCode: "SAME_CLAN", errorData: { clanName: redClanName } };

  const redClan = await ClanModel.findOne({ name: redClanName });
  if (!redClan) return { ok: false, errorCode: "CLAN_NOT_FOUND", errorData: { clanName: redClanName } };
  const blueClan = await ClanModel.findOne({ name: blueClanName });
  if (!blueClan) return { ok: false, errorCode: "CLAN_NOT_FOUND", errorData: { clanName: blueClanName } };

  const obj = {
    ...serverInfo,
    mode,
    redPlayers,
    bluePlayers,
    redScore,
    blueScore,
    redClanId: redClan._id,
    redClanName,
    blueClanId: blueClan._id,
    blueClanName,
  };

  const result = await ResultModel.create(obj);

  return { ok: true, data: { result } };
};

const parseTeamPlayers = (lines) => {
  const players = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("Id:")) {
      const playerInfo = parsePlayerInfo(line);
      players.push(playerInfo);
    }
    index++;
  }

  return players;
};

const parsePlayerInfo = (line) => {
  const [id, userName, score, kills, deaths, ratio] = line.split("|").map((item) => item.trim().split(":")[1].trim());

  return {
    userName,
    score: parseInt(score),
    kills: parseInt(kills),
    deaths: parseInt(deaths),
    flags: 0, // TODO: add flags
  };
};

const parseServerInfo = (line1, line2) => {
  let map = /Map: (.*),/.exec(line1)[1];
  map = mapServerMapping[map] || map;
  const gameType = /Gametype: (.*)\./.exec(line1)[1];
  if (gameType !== "gctf") {
    throw new Error("Invalid game type");
  }

  const totalTimeSeconds = parseInt(/Length: \d+ min (\d+) sec,/.exec(line2)[1]);
  const totalTimeMinutes = parseInt(/Length: (\d+) min \d+ sec,/.exec(line2)[1]);
  const totalTime = totalTimeMinutes * 60 + totalTimeSeconds;

  const timeLimit = parseInt(/, Timelimit: (\d+)\)/.exec(line2)[1]);
  const scoreLimit = parseInt(/, Scorelimit: (\d+),/.exec(line2)[1]);

  return {
    map,
    totalTimeSeconds,
    totalTimeMinutes,
    totalTime,
    timeLimit,
    scoreLimit,
  };
};

const computeEloResult = async (result) => {
  if (result.freezed) return { ok: false, errorCode: "ELO_ALREADY_COMPUTED" };

  let winnerResultPlayers = [];
  let looserResultPlayers = [];
  if (result.winnerSide === "red") {
    winnerResultPlayers = result.redPlayers;
    looserResultPlayers = result.bluePlayers;
  }

  if (result.winnerSide === "blue") {
    winnerResultPlayers = result.bluePlayers;
    looserResultPlayers = result.redPlayers;
  }

  let winnerElo = 0;
  let looserElo = 0;
  let winnerPlayers = [];
  let looserPlayers = [];
  for (const player of winnerResultPlayers) {
    const realPlayer = await UserModel.findById(player.userId);
    winnerElo += realPlayer.elo;
    player.eloBefore = realPlayer.elo;
    winnerPlayers.push(realPlayer);
  }

  for (const player of looserResultPlayers) {
    const realPlayer = await UserModel.findById(player.userId);
    looserElo += realPlayer.elo;
    player.eloBefore = realPlayer.elo;
    looserPlayers.push(realPlayer);
  }

  const eloWinnerBefore = winnerElo / winnerResultPlayers.length;
  const eloLooserBefore = looserElo / looserResultPlayers.length;

  const { eloGain, eloLoss } = computeElo(eloWinnerBefore, eloLooserBefore);

  if (result.winnerSide === "red") {
    result.redEloBefore = eloWinnerBefore;
    result.blueEloBefore = eloLooserBefore;
    result.redEloGain = eloGain;
    result.blueEloGain = eloLoss;
  }
  if (result.winnerSide === "blue") {
    result.blueEloBefore = eloWinnerBefore;
    result.redEloBefore = eloLooserBefore;
    result.blueEloGain = eloGain;
    result.redEloGain = eloLoss;
  }

  for (const player of winnerPlayers) {
    player.elo += eloGain;
    await player.save();
  }

  for (const player of looserPlayers) {
    player.elo += eloLoss;
    await player.save();
  }

  for (const player of winnerResultPlayers) {
    player.eloAfter = player.eloBefore + eloGain;
  }

  for (const player of looserResultPlayers) {
    player.eloAfter = player.eloBefore + eloLoss;
  }

  result.eloGain = eloGain;
  result.eloLoss = eloLoss;
  result.freezed = true;
  result.freezedAt = new Date();

  await result.save();

  for (const player of winnerPlayers) {
    const stat = await StatModel.findOne({ userId: player._id });
    stat.set({ elo: player.elo });
    await stat.save();
  }

  for (const player of looserPlayers) {
    const stat = await StatModel.findOne({ userId: player._id });
    stat.set({ elo: player.elo });
    await stat.save();
  }

  return result;
};

// see : https://www.youtube.com/watch?v=9oRDksmH0zM (sry, it's in French :/)
const computeElo = (eloWinner, eloLooser) => {
  const k = 10;
  const power = 2;
  const gap = 100;
  const redQ = eloWinner / (eloWinner + eloLooser);
  const blueQ = eloLooser / (eloWinner + eloLooser);

  const toalQuotient = Math.pow(redQ / gap, power) + Math.pow(blueQ / gap, power);

  const eloGain = k * (1 - Math.pow(redQ / gap, power) / toalQuotient);
  const eloLoss = (k * (0 - Math.pow(blueQ / gap, power))) / toalQuotient;

  return { eloGain, eloLoss };
};

const mapServerMapping = {
  ctf4_old: "ctf4_old",
  ctf5_spikes: "ctf_5",
  ctf_tantum: "ctf_tantum",
  ctf_duskwood: "ctf_duskwood",
  ctf_5_limited: "ctf_5_limited",
};

module.exports = {
  generateEmailcodeValidation,
  catchErrors,
  updateStatResult,
  updateAllStatsResult,
  updateStatPlayer,
  updateStatClan,
  parseDiscordMessage,
  parseWebhookMessage,
  computeEloResult,
  computeElo,
};
