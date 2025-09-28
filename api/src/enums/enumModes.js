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
    oneVOne: 1,
    twoVTwo: 2,
    threeVThree: 3,
    fourVFour: 4,
    fiveVFive: 5,
    sixVSix: 6,
    sevenVSeven: 7,
    eightVEight: 8,
};

const enumNumberOfPlayersForGame = {
    oneVOne: enumNumberOfPlayersPerTeam.oneVOne*2   ,
    twoVTwo: enumNumberOfPlayersPerTeam.twoVTwo*2,
    threeVThree: enumNumberOfPlayersPerTeam.threeVThree*2,
    fourVFour: enumNumberOfPlayersPerTeam.fourVFour*2,
    fiveVFive: enumNumberOfPlayersPerTeam.fiveVFive*2,
    sixVSix: enumNumberOfPlayersPerTeam.sixVSix*2,
    sevenVSeven: enumNumberOfPlayersPerTeam.sevenVSeven*2,
    eightVEight: enumNumberOfPlayersPerTeam.eightVEight*2,
};

module.exports = {enumModes, enumNumberOfPlayersForGame, enumNumberOfPlayersPerTeam};