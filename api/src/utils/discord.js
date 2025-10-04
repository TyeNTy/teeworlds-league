const discordService = require("../services/discordService");
const { ButtonStyle, EmbedBuilder } = require("discord.js");

const QueueModel = require("../models/queue");
const UserModel = require("../models/user");
const { join, leave, ready, initResultRankedMessage } = require("./queue");
const ResultRankedModel = require("../models/resultRanked");

const initCallbacksForQueues = async () => {
  const queues = await QueueModel.find({});
  for (const queue of queues) {
    registerJoinButtonCallback({ queue });
    registerLeaveButtonCallback({ queue });
  }

  const resultRankeds = await ResultRankedModel.find({ freezed: false });
  for (const resultRanked of resultRankeds) {
    registerReadyButtonCallback({ resultRanked });
  }

  return { ok: true };
};

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

  await displayQueue({ queue });

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

  await displayQueue({ queue });

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

const deleteResultRanked = async ({ resultRanked }) => {
  if (!resultRanked.guildId) return { ok: true };

  const resDeleteTextChannelDisplayResult = await discordService.deleteChannel({ channelId: resultRanked.textChannelDisplayResultId });
  if (!resDeleteTextChannelDisplayResult.ok) return resDeleteTextChannelDisplayResult;
  resultRanked.textChannelDisplayResultId = null;

  const resDeleteVoiceRedChannel = await discordService.deleteChannel({ channelId: resultRanked.voiceRedChannelId });
  if (!resDeleteVoiceRedChannel.ok) return resDeleteVoiceRedChannel;
  resultRanked.voiceRedChannelId = null;

  const resDeleteVoiceBlueChannel = await discordService.deleteChannel({ channelId: resultRanked.voiceBlueChannelId });
  if (!resDeleteVoiceBlueChannel.ok) return resDeleteVoiceBlueChannel;
  resultRanked.voiceBlueChannelId = null;

  discordService.unregisterButtonCallback(resultRanked.readyButtonId);

  return { ok: true };
};

const sendFinalResultRankedMessage = async ({ resultRanked }) => {
  if (!resultRanked.guildId) return { ok: true };

  const matchId = resultRanked._id.toString().substring(0, 8);
  const winner = resultRanked.winnerName;

  const formatPlayerWithStats = (player) => {
    const stats = `**${player.score}** pts | ${(player.kills / player.deaths).toFixed(2) || 0}K/D | ${player.flags} flags`;
    return `• **${player.userName}**\n  ${stats}`;
  };

  const redPlayersFormatted = resultRanked.redPlayers.map(formatPlayerWithStats).join("\n");
  const bluePlayersFormatted = resultRanked.bluePlayers.map(formatPlayerWithStats).join("\n");

  const embed = new EmbedBuilder()
    .setTitle("🏆 Match Completed 🏆")
    .setDescription(`**Match ${matchId}** has finished!`)
    .setColor(0xff0000)
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
        value: redPlayersFormatted || "• No players",
        inline: false,
      },
      {
        name: "🔵 Blue Team",
        value: bluePlayersFormatted || "• No players",
        inline: false,
      },
    )
    .setFooter({
      text: `Match ID: ${matchId}`,
      iconURL: "https://cdn.discordapp.com/emojis/1234567890123456789.png",
    })
    .setTimestamp();

  if (resultRanked.eloGain && resultRanked.eloLoss) {
    embed.addFields({
      name: "📈 ELO Changes",
      value: `**Winners:** +${resultRanked.eloGain.toFixed(2)}\n**Losers:** ${resultRanked.eloLoss.toFixed(2)}`,
      inline: false,
    });
  }

  const resSendMessage = await discordService.sendMessage({
    channelId: resultRanked.textChannelDisplayFinalResultId,
    embed: embed,
  });

  return resSendMessage;
};

const displayQueue = async ({ queue }) => {
  const joinButtonId = `${queue._id}_join_queue`;
  const joinQueueButton = await discordService.createButton({ customId: joinButtonId, label: "Join Queue", style: ButtonStyle.Success });

  const leaveButtonId = `${queue._id}_leave_queue`;
  const leaveQueueButton = await discordService.createButton({ customId: leaveButtonId, label: "Leave Queue", style: ButtonStyle.Danger });

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

  if (queue.messageQueueId) {
    return await discordService.updateMessage({
      channelId: queue.textChannelDisplayQueueId,
      messageId: queue.messageQueueId,
      embed: embed,
      // buttons: [joinQueueButton, leaveQueueButton],
    });
  }

  registerJoinButtonCallback({ queue });
  registerLeaveButtonCallback({ queue });

  const resSendMessage = await discordService.sendMessage({
    channelId: queue.textChannelDisplayQueueId,
    embed: embed,
    buttons: [joinQueueButton, leaveQueueButton],
  });
  if (!resSendMessage.ok) return resSendMessage;

  queue.messageQueueId = resSendMessage.data.message.id;

  return resSendMessage;
};

const registerJoinButtonCallback = async ({ queue }) => {
  const joinButtonId = queue.joinButtonId;
  discordService.registerButtonCallback(joinButtonId, async (interaction) => {
    const queueId = interaction.customId.split("_")[0];
    const queue = await QueueModel.findById(queueId);
    if (!queue) return { ok: false, message: "Queue not found" };

    const user = await UserModel.findOne({ userName: interaction.user.globalName });
    if (!user) return { ok: false, message: "User not found" };

    const resJoin = await join({ queue, user });
    if (!resJoin.ok) {
      interaction.reply({
        content: resJoin.message || "You are already in the queue!",
        ephemeral: true,
      });
      return;
    }

    await queue.save();

    await interaction.reply({
      content: `You have been added to the queue!`,
      ephemeral: true,
    });

    await displayQueue({ queue });
  });
};

const registerLeaveButtonCallback = async ({ queue }) => {
  const leaveButtonId = queue.leaveButtonId;
  discordService.registerButtonCallback(leaveButtonId, async (interaction) => {
    const queueId = interaction.customId.split("_")[0];
    const queue = await QueueModel.findById(queueId);
    if (!queue) return { ok: false, message: "Queue not found" };

    const user = await UserModel.findOne({ userName: interaction.user.globalName });
    if (!user) return { ok: false, message: "User not found" };

    const resLeave = await leave({ queue, user });
    if (!resLeave.ok) {
      await interaction.reply({
        content: resLeave.message || "You are not in the queue!",
        ephemeral: true,
      });
      return;
    }

    await queue.save();

    await interaction.reply({
      content: `You have been removed from the queue!`,
      ephemeral: true,
    });

    await displayQueue({ queue });
  });
};

const registerReadyButtonCallback = async ({ resultRanked }) => {
  const readyButtonId = resultRanked.readyButtonId;
  discordService.registerButtonCallback(readyButtonId, async (interaction) => {
    const resultRankedId = interaction.customId.split("_")[0];
    const resultRanked = await ResultRankedModel.findById(resultRankedId);
    if (!resultRanked) return { ok: false, message: "Result ranked not found" };

    const user = await UserModel.findOne({ userName: interaction.user.globalName });
    if (!user) return { ok: false, message: "User not found" };

    const resReady = await ready({ resultRanked, user });
    if (!resReady.ok) {
      await interaction.reply({
        content: resReady.message || "Player not in result ranked",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: `You have been marked as ready!`, ephemeral: true });

    await initResultRankedMessage({ resultRanked });
  });

  await initResultRankedMessage({ resultRanked });

  return { ok: true };
};

module.exports = {
  createNewQueue,
  updateQueue,
  deleteQueue,
  initCallbacksForQueues,
  displayQueue,
  deleteResultRanked,
  sendFinalResultRankedMessage,
};
