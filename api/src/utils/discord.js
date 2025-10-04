const discordService = require("../services/discordService");
const { ButtonStyle } = require("discord.js");

const QueueModel = require("../models/queue");
const UserModel = require("../models/user");
const { join, leave } = require("./queue");

const initCallbacksForQueues = async () => {
  const queues = await QueueModel.find({});
  for (const queue of queues) {
    registerJoinButtonCallback({ queue });
    registerLeaveButtonCallback({ queue });
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

  const joinButtonId = `${queue._id}_join_queue`;
  const joinQueueButton = await discordService.createButton({ customId: joinButtonId, label: "Join Queue", style: ButtonStyle.Success });
  registerJoinButtonCallback({ queue });

  const leaveButtonId = `${queue._id}_leave_queue`;
  const leaveQueueButton = await discordService.createButton({ customId: leaveButtonId, label: "Leave Queue", style: ButtonStyle.Danger });
  registerLeaveButtonCallback({ queue });

  const resMessageQueue = await discordService.sendMessage({
    channelId: resCreateTextChannelDisplayQueue.data.channel.id,
    message: "Welcome to the queue! Use the `/join` command to join the queue.",
    buttons: [joinQueueButton, leaveQueueButton],
  });
  if (!resMessageQueue.ok) return resMessageQueue;

  queue.categoryQueueId = resCreateCategoryQueue.data.category.id;
  queue.textChannelDisplayQueueId = resCreateTextChannelDisplayQueue.data.channel.id;
  queue.textChannelDisplayResultsId = resCreateTextChannelDisplayResults.data.channel.id;
  queue.joinButtonId = joinButtonId;
  queue.leaveButtonId = leaveButtonId;
  await queue.save();

  return {
    categoryQueueId: resCreateCategoryQueue.data.category.id,
    textChannelDisplayQueueId: resCreateTextChannelDisplayQueue.data.channel.id,
    textChannelDisplayResultsId: resCreateTextChannelDisplayResults.data.channel.id,
  };
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

  return { ok: true };
};

const deleteQueue = async ({ queue }) => {
  if (!queue.guildId) return { ok: true };

  const resDeleteTextChannelDisplayQueue = await discordService.deleteChannel({ channelId: queue.textChannelDisplayQueueId });
  if (!resDeleteTextChannelDisplayQueue.ok) return resDeleteTextChannelDisplayQueue;
  const resDeleteTextChannelDisplayResults = await discordService.deleteChannel({ channelId: queue.textChannelDisplayResultsId });
  if (!resDeleteTextChannelDisplayResults.ok) return resDeleteTextChannelDisplayResults;
  const resDeleteCategoryQueue = await discordService.deleteCategory({ categoryId: queue.categoryQueueId });
  if (!resDeleteCategoryQueue.ok) return resDeleteCategoryQueue;

  return { ok: true };
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
      await interaction.reply({
        content: resJoin.message || "You are already in the queue!",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `You have been added to the queue!`,
      ephemeral: true,
    });
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

    await interaction.reply({
      content: `You have been removed from the queue!`,
      ephemeral: true,
    });
  });
};

module.exports = {
  createNewQueue,
  updateQueue,
  deleteQueue,
  initCallbacksForQueues,
};
