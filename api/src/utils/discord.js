const discordService = require("../services/discordService");

const initNewQueue = async ({ queue }) => {
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

  const resMessageQueue = await discordService.sendMessage({
    channelId: resCreateTextChannelDisplayQueue.data.channel.id,
    message: "Welcome to the queue! Use the `/join` command to join the queue.",
  });
  if (!resMessageQueue.ok) return resMessageQueue;

  queue.categoryQueueId = resCreateCategoryQueue.data.category.id;
  queue.textChannelDisplayQueueId = resCreateTextChannelDisplayQueue.data.channel.id;
  queue.textChannelDisplayResultsId = resCreateTextChannelDisplayResults.data.channel.id;
  await queue.save();

  return {
    categoryQueueId: resCreateCategoryQueue.data.category.id,
    textChannelDisplayQueueId: resCreateTextChannelDisplayQueue.data.channel.id,
    textChannelDisplayResultsId: resCreateTextChannelDisplayResults.data.channel.id,
  };
};

const updateQueue = async ({ queue }) => {
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
  const resDeleteTextChannelDisplayQueue = await discordService.deleteChannel(queue.textChannelDisplayQueueId);
  if (!resDeleteTextChannelDisplayQueue.ok) return resDeleteTextChannelDisplayQueue;
  const resDeleteTextChannelDisplayResults = await discordService.deleteChannel(queue.textChannelDisplayResultsId);
  if (!resDeleteTextChannelDisplayResults.ok) return resDeleteTextChannelDisplayResults;
  const resDeleteCategoryQueue = await discordService.deleteCategory(queue.categoryQueueId);
  if (!resDeleteCategoryQueue.ok) return resDeleteCategoryQueue;

  return { ok: true };
};

module.exports = {
  initNewQueue,
  updateQueue,
  deleteQueue,
};
