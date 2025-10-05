const QueueModel = require("../models/queue");
const { createGameFromQueue } = require("../utils/queue");
const { displayQueue } = require("../utils/discord");

const createGamesFromQueue = async () => {
  const queues = await QueueModel.find({});

  for (const queue of queues) {
    const resCreateGameFromQueue = await createGameFromQueue({ queue });
    if (!resCreateGameFromQueue.ok) continue;

    await displayQueue({ queue });
  }
};

module.exports = { createGamesFromQueue };
