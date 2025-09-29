const chooseMap = (queue) => {
    return queue.maps[Math.random() * queue.maps.length | 0];
}

const choosePlayers = (queue) => {
    const numberOfPlayersPerTeam = queue.numberOfPlayersPerTeam;
    const numberOfPlayersForGame = queue.numberOfPlayersForGame;

    const playersToChoose = queue.players.sort((player) => player.joinedAt).slice(0, numberOfPlayersForGame);

    const playersShuffled = [...playersToChoose].sort(() => Math.random() - 0.5);

    const bluePlayers = playersShuffled.slice(0, numberOfPlayersPerTeam);
    const redPlayers = playersShuffled.slice(numberOfPlayersPerTeam, numberOfPlayersForGame);

    return { bluePlayers, redPlayers };
}

module.exports = { chooseMap, choosePlayers };