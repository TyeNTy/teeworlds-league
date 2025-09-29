const QueueModel = require("../models/queue");
const UserModel = require("../models/user");
const ResultRankedModel = require("../models/resultRanked");
const { chooseMap, choosePlayers } = require("../utils/queue");

const createGamesFromQueue = async () => {
    const queues = await QueueModel.find({});

    for (const queue of queues) {
        const players = queue.players;
        if(players.length < queue.numberOfPlayersForGame) continue;

        const { bluePlayers, redPlayers } = choosePlayers(queue);

        const blueRealPlayers = await UserModel.find({ _id: { $in: bluePlayers.map(player => player.userId) } });
        const redRealPlayers = await UserModel.find({ _id: { $in: redPlayers.map(player => player.userId) } });

        const bluePlayersObj = blueRealPlayers.map(player => ({
            userId: player._id,
            userName: player.userName,
            avatar: player.avatar,
            eloBefore: player.eloRanked,
        }));
        const redPlayersObj = redRealPlayers.map(player => ({
            userId: player._id,
            userName: player.userName,
            avatar: player.avatar,
            eloBefore: player.eloRanked,
        }));

        const newResultRankedObj = {
            queueId: queue._id,
            numberFromQueue: queue.numberOfGames,
            queueName: queue.name,

            bluePlayers: bluePlayersObj,
            redPlayers: redPlayersObj,

            mode: queue.mode,
            map: chooseMap(queue),
        }

        const newResultRanked = await ResultRankedModel.create(newResultRankedObj);
        console.log("New game created");
        console.log(newResultRanked);

        for (const player of bluePlayersObj) {
            queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
        }
        for (const player of redPlayersObj) {
            queue.players = queue.players.filter((playerQueue) => playerQueue.userId.toString() !== player.userId.toString());
        }

        queue.numberOfGames++;
        await queue.save();
        
    }
}

module.exports = {createGamesFromQueue};