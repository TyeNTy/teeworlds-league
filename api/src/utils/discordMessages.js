const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const discordService = require("../services/discordService");
const ResultRankedModel = require("../models/resultRanked");
const UserModel = require("../models/user");
const { ready, arePlayersReady, join, leave } = require("./resultRanked");
const QueueModel = require("../models/queue");
const { catchErrors } = require(".");

const discordMessageQueue = async ({ queue }) => {
  const joinButtonId = `${queue._id}_join_queue`;
  const joinQueueButton = createButton({ customId: joinButtonId, label: "Join Queue", style: ButtonStyle.Success });

  const leaveButtonId = `${queue._id}_leave_queue`;
  const leaveQueueButton = createButton({ customId: leaveButtonId, label: "Leave Queue", style: ButtonStyle.Danger });

  const embed = new EmbedBuilder()
    .setTitle(queue.name)
    .setColor(0x0099ff)
    .addFields(
      {
        name: "Maps",
        value: queue.maps.join(", "),
        inline: true,
      },
      {
        name: "Mode",
        value: queue.mode,
        inline: true,
      },
      {
        name: "Players",
        value: queue.players.length + " / " + queue.numberOfPlayersForGame,
        inline: true,
      },
      {
        name: "IMPORTANT",
        value: "Be sure to be in a queue server and that your discord name is the same as your ingame name.",
        inline: true,
      },
    )
    .setTimestamp();

  queue.joinButtonId = joinButtonId;
  queue.leaveButtonId = leaveButtonId;

  discordService.registerButtonCallback(joinButtonId, joinQueueButtonCallBack);
  discordService.registerButtonCallback(leaveButtonId, leaveQueueButtonCallBack);

  await queue.save();

  return {
    embed: embed,
    buttons: [joinQueueButton, leaveQueueButton],
  };
};

const discordMessageResultRanked = ({ resultRanked }) => {
  const { bluePlayers, redPlayers } = resultRanked;

  const matchId = resultRanked._id.toString();

  const winner = resultRanked.winnerName;
  const winnerColor = resultRanked.winnerSide === "red" ? 0xff0000 : 0x0000ff;

  const redPlayersFormatted = redPlayers.map((player) => formatPlayerWithStats({ player, resultRanked })).join("\n");
  const bluePlayersFormatted = bluePlayers.map((player) => formatPlayerWithStats({ player, resultRanked })).join("\n");

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
  };
};

const discordMessageResultRankedNotReady = async ({ resultRanked }) => {
  const readyButtonId = `${resultRanked._id}_ready`;
  const readyButton = createButton({ customId: readyButtonId, label: "Ready", style: ButtonStyle.Success });
  const allPlayers = [...resultRanked.redPlayers, ...resultRanked.bluePlayers];

  resultRanked.readyButtonId = readyButtonId;
  await resultRanked.save();

  discordService.registerButtonCallback(readyButtonId, readyButtonCallBack);

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
    buttons: [readyButton],
  };
};

const discordPrivateMessageNewQueue = ({ resultRanked }) => {
  const embed = new EmbedBuilder()
    .setTitle("Game found : " + resultRanked.queueName)
    .setColor(0x0099ff)
    .addFields({
      name: "📢 Join the game channel",
      value: `[Game channel to get ready !](https://discord.com/channels/${resultRanked.guildId}/${resultRanked.textChannelDisplayResultId}`,
      inline: false,
    })
    .setTimestamp();

  return {
    embed: embed,
    message: "New game found!",
  };
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

const formatPlayerWithStats = ({ player, resultRanked }) => {
  if (resultRanked.freezed) {
    const stats = `**${player.score}** pts | ${Math.round(player.kills / player.deaths, 2)} K/D | ${player.flags} flags`;
    return `• **${player.userName}**\n  ${stats}`;
  }
  return `• ${player.userName}`;
};

const createButton = ({ customId, label, style }) => {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
};

// CALLBACKS

const joinQueueButtonCallBack = async (interaction) => {
  try {
    const queueId = interaction.customId.split("_")[0];
    const queue = await QueueModel.findById(queueId);
    if (!queue) return { ok: false, message: "Queue not found" };

    const user = await UserModel.findOne({ userName: interaction.member.displayName });
    if (!user) return { ok: false, message: "User not found" };

    const resJoin = await join({ queue, user });
    if (!resJoin.ok) {
      await interaction.reply({
        content: resJoin.message || "You are already in the queue!",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await queue.save();

    await interaction.reply({
      content: `You have been added to the queue!`,
      flags: [MessageFlags.Ephemeral],
    });

    if (!user.discordId) {
      user.discordId = interaction.member.id;

      const resCreateChannel = await discordService.createPrivateMessageChannel({ userId: user.discordId });
      if (!resCreateChannel.ok) return { ok: false, message: "Failed to create private message channel" };

      await discordService.sendPrivateMessage({
        userId: user.discordId,
        message: "Welcome ! Your discord has been successfully linked to your account. Hf !",
      });

      await user.save();
    }

    const discordMessage = await discordMessageQueue({ queue });
    await discordService.updateMessage({
      channelId: queue.textChannelDisplayQueueId,
      messageId: queue.messageQueueId,
      ...discordMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

const leaveQueueButtonCallBack = async (interaction) => {
  try {
    const queueId = interaction.customId.split("_")[0];
    const queue = await QueueModel.findById(queueId);
    if (!queue) return { ok: false, message: "Queue not found" };

    const user = await UserModel.findOne({ userName: interaction.member.displayName });
    if (!user) return { ok: false, message: "User not found" };

    const resLeave = await leave({ queue, user });
    if (!resLeave.ok) {
      await interaction.reply({
        content: resLeave.message || "You are not in the queue!",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.reply({
      content: `You left the queue!`,
      flags: [MessageFlags.Ephemeral],
    });

    const discordMessage = await discordMessageQueue({ queue });
    await discordService.updateMessage({
      channelId: queue.textChannelDisplayQueueId,
      messageId: queue.messageQueueId,
      ...discordMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

const readyButtonCallBack = async (interaction) => {
  try {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Game not found" };

    const user = await UserModel.findOne({ userName: interaction.member.displayName });
    if (!user) return { ok: false, message: "User not found" };

    const resReady = await ready({ resultRanked, user });
    if (!resReady.ok) return { ok: false, message: "Player not in result ranked" };

    await interaction.reply({ content: `You have been marked as ready!`, flags: [MessageFlags.Ephemeral] });

    if (arePlayersReady({ resultRanked })) {
      discordService.deleteMessage({ channelId: resultRanked.textChannelDisplayResultId, messageId: resultRanked.messageReadyId });
      resultRanked.messageReadyId = null;

      discordService.unregisterButtonCallback(resultRanked.readyButtonId);
      resultRanked.readyButtonId = null;

      const resSendMessage = await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayResultId,
        ...discordMessageResultRanked({ resultRanked }),
      });
      resultRanked.messageResultId = resSendMessage.data.message.id;

      await resultRanked.save();
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  // Queue
  discordMessageQueue,
  discordPrivateMessageNewQueue,

  // Result Ranked
  discordMessageResultRanked,
  discordMessageResultRankedNotReady,

  // Callbacks
  readyButtonCallBack,
  joinQueueButtonCallBack,
  leaveQueueButtonCallBack,
};
