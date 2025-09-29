const cron = require("node-cron");
const { createGamesFromQueue } = require("./createGamesFromQueue");

// Example for a CRON job every 5s :
"*/5 * * * * *"
// Example for every day at 12:00:00 :
"0 12 * * *"

const initCron = () => {
    // Try to create a Queue every 3 seconds
    cron.schedule("*/3 * * * * *", () => {
        createGamesFromQueue();
    });
};

module.exports = initCron;