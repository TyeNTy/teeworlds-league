const enumModes = {
    oneVOne: "1v1",
    twoVTwo: "2v2",
    threeVThree: "3v3",
    fourVFour: "4v4",
    fiveVFive: "5v5",
    sixVSix: "6v6",
    sevenVSeven: "7v7",
    eightVEight: "8v8",
};

const enumNumberOfPlayersPerTeam = {
    "1v1": 1,
    "2v2": 2,
    "3v3": 3,
    "4v4": 4,
    "5v5": 5,
    "6v6": 6,
    "7v7": 7,
    "8v8": 8,
};

const enumNumberOfPlayersForGame = {
    "1v1": enumNumberOfPlayersPerTeam["1v1"]*2   ,
    "2v2": enumNumberOfPlayersPerTeam["2v2"]*2,
    "3v3": enumNumberOfPlayersPerTeam["3v3"]*2,
    "4v4": enumNumberOfPlayersPerTeam["4v4"]*2,
    "5v5": enumNumberOfPlayersPerTeam["5v5"]*2,
    "6v6": enumNumberOfPlayersPerTeam["6v6"]*2,
    "7v7": enumNumberOfPlayersPerTeam["7v7"]*2,
    "8v8": enumNumberOfPlayersPerTeam["8v8"]*2,
};

module.exports = {enumModes, enumNumberOfPlayersForGame, enumNumberOfPlayersPerTeam};