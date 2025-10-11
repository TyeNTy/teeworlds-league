const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const discordService = require("../services/discordService");
const ResultRankedModel = require("../models/resultRanked");
const UserModel = require("../models/user");
const {
  ready,
  arePlayersReady,
  join,
  leave,
  voteCancel,
  voteRed,
  voteBlue,
  updateAllStatsResultRanked,
  arePlayersVotedRed,
  deleteResultRankedDiscord,
  arePlayersVotedBlue,
  arePlayersVotedCancel,
} = require("./resultRanked");
const QueueModel = require("../models/queue");

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

const discordMessageResultRanked = async ({ resultRanked }) => {
  if (resultRanked.freezed && !resultRanked.hasBeenVoted) {
    return await discordMessageResultRankedFreezed({ resultRanked });
  }
  if (resultRanked.freezed && resultRanked.hasBeenVoted && resultRanked.hasBeenCanceled) {
    return await discordMessageResultRankedCanceled({ resultRanked });
  }
  if (resultRanked.freezed && resultRanked.hasBeenVoted && !resultRanked.hasBeenCanceled) {
    return await discordMessageResultRankedVoted({ resultRanked });
  }

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

  const obj = {
    embed: embed,
  };

  if (!resultRanked.freezed) {
    const voteRedButtonId = `${resultRanked._id}_vote_red`;
    const voteBlueButtonId = `${resultRanked._id}_vote_blue`;
    const voteCancelButtonId = `${resultRanked._id}_vote_cancel`;

    obj.buttons = [
      createButton({ customId: voteRedButtonId, label: "Vote Red", style: ButtonStyle.Danger }),
      createButton({ customId: voteBlueButtonId, label: "Vote Blue", style: ButtonStyle.Primary }),
      createButton({ customId: voteCancelButtonId, label: "Vote Cancel", style: ButtonStyle.Secondary }),
    ];

    discordService.registerButtonCallback(voteRedButtonId, voteRedResultRankedButtonCallBack);
    discordService.registerButtonCallback(voteBlueButtonId, voteBlueResultRankedButtonCallBack);
    discordService.registerButtonCallback(voteCancelButtonId, cancelResultRankedButtonCallBack);

    resultRanked.voteCancelButtonId = voteCancelButtonId;
    resultRanked.voteRedButtonId = voteRedButtonId;
    resultRanked.voteBlueButtonId = voteBlueButtonId;

    await resultRanked.save();

    const redVoteField = formatRedVotes({ resultRanked });
    const blueVoteField = formatBlueVotes({ resultRanked });
    const cancelVoteField = formatCancelVotes({ resultRanked });

    embed.addFields(redVoteField);
    embed.addFields(blueVoteField);
    embed.addFields(cancelVoteField);
  }

  return obj;
};

const discordMessageResultRankedFreezed = async ({ resultRanked }) => {
  const { bluePlayers, redPlayers } = resultRanked;

  const matchId = resultRanked._id.toString();

  const winner = resultRanked.winnerName;
  const winnerColor = resultRanked.winnerSide === "red" ? 0xff0000 : 0x0000ff;

  const redPlayersFormatted = redPlayers.map((player) => formatPlayerWithStats({ player, resultRanked })).join("\n");
  const bluePlayersFormatted = bluePlayers.map((player) => formatPlayerWithStats({ player, resultRanked })).join("\n");

  const embed = new EmbedBuilder()
    .setTitle("🏆 Match Completed 🏆")
    .setDescription(`**Match ${matchId}** has finished!`)
    .setColor(resultRanked.freezed ? winnerColor : 0x0099ff)
    .addFields(
      {
        name: "🎯 Result",
        value: `**${winner} won**\n${resultRanked.redScore} - ${resultRanked.blueScore}`,
        inline: false,
      },
      {
        name: "🗺️ Map",
        value: `**${resultRanked.map}**`,
        inline: true,
      },
      {
        name: "⏱️ Duration",
        value: `${resultRanked.totalTimeMinutes || 0}:${String(resultRanked.totalTimeSeconds || 0).padStart(2, "0")}`,
        inline: true,
      },
      {
        name: "🔴 Red Team",
        value: redPlayersFormatted,
        inline: true,
      },
      {
        name: "🔵 Blue Team",
        value: bluePlayersFormatted,
        inline: true,
      },
    )
    .setTimestamp();

  if (resultRanked.eloGain && resultRanked.eloLoss) {
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

const discordMessageResultRankedVoted = async ({ resultRanked }) => {
  const { bluePlayers, redPlayers } = resultRanked;

  const matchId = resultRanked._id.toString();

  const winner = resultRanked.winnerName;
  const winnerColor = resultRanked.winnerSide === "red" ? 0xff0000 : 0x0000ff;

  const redPlayersFormatted = formatPlayers(redPlayers);
  const bluePlayersFormatted = formatPlayers(bluePlayers);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Match Completed 🏆")
    .setDescription(`**Match ${matchId}** has finished!`)
    .setColor(winnerColor)
    .addFields(
      {
        name: "🎯 Result",
        value: `**${winner} won**`,
        inline: false,
      },
      {
        name: "🗺️ Map",
        value: `**${resultRanked.map}**`,
        inline: true,
      },
      {
        name: "🔴 Red Team",
        value: redPlayersFormatted,
        inline: true,
      },
      {
        name: "🔵 Blue Team",
        value: bluePlayersFormatted,
        inline: true,
      },
    )
    .setTimestamp();

  if (resultRanked.eloGain && resultRanked.eloLoss) {
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

const discordMessageResultRankedCanceled = async ({ resultRanked }) => {
  const { bluePlayers, redPlayers } = resultRanked;

  const matchId = resultRanked._id.toString();

  const winnerColor = 0x0000ff;

  const redPlayersFormatted = formatPlayers(redPlayers);
  const bluePlayersFormatted = formatPlayers(bluePlayers);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Match Canceled 🏆")
    .setDescription(`**Match ${matchId}** has been canceled!`)
    .setColor(winnerColor)
    .addFields(
      {
        name: "🎯 Reason",
        value: `**Match canceled by vote !**`,
        inline: false,
      },
      {
        name: "🗺️ Map",
        value: `**${resultRanked.map}**`,
        inline: true,
      },
      {
        name: "🔴 Red Team",
        value: redPlayersFormatted,
        inline: true,
      },
      {
        name: "🔵 Blue Team",
        value: bluePlayersFormatted,
        inline: true,
      },
    )
    .setTimestamp();

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

const formatRedVotes = ({ resultRanked }) => {
  const allPlayers = [...resultRanked.redPlayers, ...resultRanked.bluePlayers];
  const votedPlayers = allPlayers.filter((player) => player.voteRed);

  const field = {
    name: "Red Votes (" + votedPlayers.length + " / " + allPlayers.length + ")",
    value: votedPlayers.map((player) => `• ${player.userName}`).join("\n"),
    inline: false,
  };

  if (votedPlayers.length === 0) {
    field.value = "• No players";
  }

  return field;
};

const formatBlueVotes = ({ resultRanked }) => {
  const allPlayers = [...resultRanked.redPlayers, ...resultRanked.bluePlayers];
  const votedPlayers = allPlayers.filter((player) => player.voteBlue);

  const field = {
    name: "Blue Votes (" + votedPlayers.length + " / " + allPlayers.length + ")",
    value: votedPlayers.map((player) => `• ${player.userName}`).join("\n"),
    inline: false,
  };

  if (votedPlayers.length === 0) {
    field.value = "• No players";
  }

  return field;
};

const formatCancelVotes = ({ resultRanked }) => {
  const allPlayers = [...resultRanked.redPlayers, ...resultRanked.bluePlayers];
  const votedPlayers = allPlayers.filter((player) => player.voteCancel);

  const field = {
    name: "Cancel Votes (" + votedPlayers.length + " / " + allPlayers.length + ")",
    value: votedPlayers.map((player) => `• ${player.userName}`).join("\n"),
    inline: false,
  };

  if (votedPlayers.length === 0) {
    field.value = "• No players";
  }

  return field;
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
        ...(await discordMessageResultRanked({ resultRanked })),
      });
      resultRanked.messageResultId = resSendMessage.data.message.id;

      await resultRanked.save();
    }
  } catch (error) {
    console.error(error);
  }
};

const cancelResultRankedButtonCallBack = async (interaction) => {
  try {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Game not found" };

    const user = await UserModel.findOne({ discordId: interaction.member.id });
    if (!user) return { ok: false, message: "User not found" };

    const resVoteCancel = await voteCancel({ resultRanked, user });
    if (!resVoteCancel.ok) return { ok: false, message: "Player not in result ranked" };

    await interaction.reply({ content: `You have voted to cancel the game!`, flags: [MessageFlags.Ephemeral] });

    if (arePlayersVotedCancel({ resultRanked })) {
      resultRanked.hasBeenVoted = true;
      resultRanked.hasBeenVotedAt = new Date();

      resultRanked.hasBeenCanceled = true;

      await updateAllStatsResultRanked(resultRanked);

      await deleteResultRankedDiscord({ resultRanked });

      await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayFinalResultId,
        ...(await discordMessageResultRanked({ resultRanked })),
      });

      return;
    }

    const discordMessage = await discordMessageResultRanked({ resultRanked });
    await discordService.updateMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      messageId: resultRanked.messageResultId,
      ...discordMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

const voteRedResultRankedButtonCallBack = async (interaction) => {
  try {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Game not found" };

    const user = await UserModel.findOne({ discordId: interaction.member.id });
    if (!user) return { ok: false, message: "User not found" };

    const resVoteRed = await voteRed({ resultRanked, user });
    if (!resVoteRed.ok) return { ok: false, message: "Player not in result ranked" };

    await interaction.reply({ content: `You have voted for the red team!`, flags: [MessageFlags.Ephemeral] });

    if (arePlayersVotedRed({ resultRanked })) {
      resultRanked.hasBeenVoted = true;
      resultRanked.hasBeenVotedAt = new Date();

      resultRanked.redScore = 1000;
      resultRanked.blueScore = 0;

      await updateAllStatsResultRanked(resultRanked);

      await deleteResultRankedDiscord({ resultRanked });

      await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayFinalResultId,
        ...(await discordMessageResultRanked({ resultRanked })),
      });

      return;
    }

    const discordMessage = await discordMessageResultRanked({ resultRanked });
    await discordService.updateMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      messageId: resultRanked.messageResultId,
      ...discordMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

const voteBlueResultRankedButtonCallBack = async (interaction) => {
  try {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Game not found" };

    const user = await UserModel.findOne({ discordId: interaction.member.id });
    if (!user) return { ok: false, message: "User not found" };

    const resVoteBlue = await voteBlue({ resultRanked, user });
    if (!resVoteBlue.ok) return { ok: false, message: "Player not in result ranked" };

    await interaction.reply({ content: `You have voted for the blue team!`, flags: [MessageFlags.Ephemeral] });

    if (arePlayersVotedBlue({ resultRanked })) {
      resultRanked.hasBeenVoted = true;
      resultRanked.hasBeenVotedAt = new Date();

      resultRanked.blueScore = 1000;
      resultRanked.redScore = 0;

      await updateAllStatsResultRanked(resultRanked);

      await deleteResultRankedDiscord({ resultRanked });

      await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayFinalResultId,
        ...(await discordMessageResultRanked({ resultRanked })),
      });

      return;
    }

    const discordMessage = await discordMessageResultRanked({ resultRanked });
    await discordService.updateMessage({
      channelId: resultRanked.textChannelDisplayResultId,
      messageId: resultRanked.messageResultId,
      ...discordMessage,
    });
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
  cancelResultRankedButtonCallBack,
  voteRedResultRankedButtonCallBack,
  voteBlueResultRankedButtonCallBack,
};
