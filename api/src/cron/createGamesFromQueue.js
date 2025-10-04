const QueueModel = require("../models/queue");
const { createGameFromQueue } = require("../utils/queue");

const createGamesFromQueue = async () => {
  const queues = await QueueModel.find({});

  for (const queue of queues) {
    createGameFromQueue({ queue });
  }
};

module.exports = { createGamesFromQueue };
