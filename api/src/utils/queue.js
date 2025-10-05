const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const StatRankedModel = require("../models/statRanked");
const discordService = require("../services/discordService");
const { EmbedBuilder, ButtonStyle } = require("discord.js");

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

const ready = async ({ resultRanked, user }) => {
  if (!resultRanked) return { ok: false, message: "Result ranked not found" };
  if (
    !resultRanked.redPlayers.some((player) => player.userId.toString() === user._id.toString()) &&
    !resultRanked.bluePlayers.some((player) => player.userId.toString() === user._id.toString())
  )
    return { ok: false, message: "Player not in result ranked" };

  resultRanked.redPlayers.forEach((player) => {
    if (player.userId.toString() === user._id.toString()) {
      player.isReady = true;
    }
  });

  resultRanked.bluePlayers.forEach((player) => {
    if (player.userId.toString() === user._id.toString()) {
      player.isReady = true;
    }
  });

  await resultRanked.save();

  await initResultRankedMessage({ resultRanked });

  return { ok: true, data: { resultRanked, user } };
};

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

  const resInitResultRankedMessage = await initResultRankedMessage({ resultRanked: newResultRanked });
  if (!resInitResultRankedMessage.ok) return { ok: false, message: "Failed to initialize result ranked message" };

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

  await newResultRanked.save();

  return { ok: true, data: { newResultRanked, queue } };
};

const initResultRankedMessage = async ({ resultRanked }) => {
  if (!resultRanked.guildId) return { ok: true };

  if (!resultRanked.textChannelDisplayResultId) {
    const resCreateTextChannelDisplayResults = await discordService.createTextChannel({
      guildId: resultRanked.guildId,
      name: "queue_" + resultRanked.id.toString(),
      categoryId: resultRanked.categoryQueueId,
    });

    resultRanked.textChannelDisplayResultId = resCreateTextChannelDisplayResults.data.channel.id;
  }

  if (!resultRanked.messageResultId) {
    const { embed, message, buttons } = await generateResultRankedMessage({ resultRanked });
    const resCreateMessageResult = await discordService.sendMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      message: message,
      embed: embed,
      buttons: buttons,
    });
    resultRanked.messageResultId = resCreateMessageResult.data.message.id;
  } else {
    const { embed, message, buttons } = await generateResultRankedMessage({ resultRanked });
    await discordService.updateMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      messageId: resultRanked.messageResultId,
      message: message,
      embed: embed,
      buttons: buttons,
    });
  }

  await resultRanked.save();

  return { ok: true };
};

const getGameStatus = ({ resultRanked }) => {
  if (resultRanked.freezed) {
    return "Match Completed 🏆";
  } else if (resultRanked.blueScore > 0 || resultRanked.redScore > 0) {
    return "Match In Progress 🏆";
  } else {
    return "Match Starting 🏆";
  }
};

const formatPlayers = (players) => {
  return players.map((player) => `• ${player.userName}`).join("\n") || "• No players";
};

const generateResultRankedMessage = async ({ resultRanked }) => {
  const { bluePlayers, redPlayers } = resultRanked;

  if (resultRanked.redPlayers.some((player) => !player.isReady) || resultRanked.bluePlayers.some((player) => !player.isReady)) {
    return await generateResultRankedMessageNotReady({ resultRanked });
  }

  const matchId = resultRanked._id.toString();

  const winner = resultRanked.winnerName;
  const winnerColor = resultRanked.winnerSide === "red" ? 0xff0000 : 0x0000ff;

  const formatPlayerWithStats = (player) => {
    if (resultRanked.freezed) {
      const stats = `**${player.score}** pts | ${player.kills}K/${player.deaths}D | ${player.flags} flags`;
      return `• **${player.userName}**\n  ${stats}`;
    }
    return `• ${player.userName}`;
  };

  const redPlayersFormatted = redPlayers.map(formatPlayerWithStats).join("\n");
  const bluePlayersFormatted = bluePlayers.map(formatPlayerWithStats).join("\n");

  const embed = new EmbedBuilder()
    .setTitle(resultRanked.freezed ? "🏆 Match Completed 🏆" : "🏆 Match In Progress 🏆")
    .setDescription(`**Match ${matchId}** has ${resultRanked.freezed ? "finished" : "started"}!`)
    .setColor(resultRanked.freezed ? winnerColor : 0x0099ff)
    .addFields(
      {
        name: resultRanked.freezed ? "🎯 Result" : "🗺️ Map",
        value: resultRanked.freezed ? `**${winner} won**\n${resultRanked.redScore} - ${resultRanked.blueScore}` : resultRanked.map,
        inline: resultRanked.freezed ? false : true,
      },
      {
        name: resultRanked.freezed ? "🗺️ Map" : "🔴 Red Team",
        value: resultRanked.freezed ? `**${resultRanked.map}**` : redPlayersFormatted,
        inline: true,
      },
      {
        name: resultRanked.freezed ? "⏱️ Duration" : "🔵 Blue Team",
        value: resultRanked.freezed
          ? `${resultRanked.totalTimeMinutes || 0}:${String(resultRanked.totalTimeSeconds || 0).padStart(2, "0")}`
          : bluePlayersFormatted,
        inline: true,
      },
      {
        name: resultRanked.freezed ? "🔴 Red Team" : "IMPORTANT",
        value: resultRanked.freezed
          ? redPlayersFormatted
          : "Be sure to be in a queue server and that your discord name is the same as your ingame name.",
        inline: resultRanked.freezed ? true : true,
      },
      {
        name: resultRanked.freezed ? "🔵 Blue Team" : "",
        value: resultRanked.freezed ? bluePlayersFormatted : "",
        inline: resultRanked.freezed ? true : true,
      },
    )
    .setTimestamp();

  if (resultRanked.freezed && resultRanked.eloGain && resultRanked.eloLoss) {
    embed.addFields({
      name: "📈 ELO Changes",
      value: `**Winners:** +${resultRanked.eloGain} ELO\n**Losers:** ${resultRanked.eloLoss} ELO`,
      inline: false,
    });
  }

  return {
    embed: embed,
    message: resultRanked.freezed ? "Match completed!" : "New queue started!",
  };
};

const generateResultRankedMessageNotReady = async ({ resultRanked }) => {
  const readyButtonId = `${resultRanked._id}_ready`;
  const readyButton = await discordService.createButton({ customId: readyButtonId, label: "Ready", style: ButtonStyle.Success });
  const allPlayers = [...resultRanked.redPlayers, ...resultRanked.bluePlayers];

  resultRanked.readyButtonId = readyButtonId;
  await resultRanked.save();

  discordService.registerButtonCallback(readyButtonId, async (interaction) => {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Result ranked not found" };

    const user = await UserModel.findOne({ userName: interaction.user.globalName });
    if (!user) return { ok: false, message: "User not found" };

    const resReady = await ready({ resultRanked, user });
    if (!resReady.ok) return { ok: false, message: "Player not in result ranked" };

    await interaction.reply({ content: `You have been marked as ready!`, ephemeral: true });

    await initResultRankedMessage({ resultRanked });
  });

  const embed = new EmbedBuilder()
    .setTitle(getGameStatus({ resultRanked }))
    .setColor(0x0099ff)
    .addFields(
      {
        name: "Not ready",
        value: formatPlayers(allPlayers.filter((player) => !player.isReady)),
        inline: true,
      },
      {
        name: "Ready",
        value: formatPlayers(allPlayers.filter((player) => player.isReady)),
        inline: true,
      },
      {
        name: "IMPORTANT",
        value: "Be sure to be in a queue server and that your discord name is the same as your ingame name.",
        inline: true,
      },
    );

  return {
    embed: embed,
    message: "Players are not ready!",
    buttons: [readyButton],
  };
};

module.exports = { chooseMap, choosePlayers, join, leave, ready, createGameFromQueue, initResultRankedMessage };
