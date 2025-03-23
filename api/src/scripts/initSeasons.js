require("../mongo");
const SeasonModel = require("../models/season");
const ResultModel = require("../models/result");
const ClanModel = require("../models/clan");
const StatModel = require("../models/stat");

const init = async () => {
  const nameSeason1 = "Season 1";

  const seasons = await SeasonModel.find({ name: nameSeason1 });

  if (seasons.length === 0) {
    const season = await SeasonModel.create({
      name: nameSeason1,
      startDate: new Date("2024-09-23"),
      endDate: new Date("2025-02-16"),
      isActive: true,
    });

    seasons.push(season);
  }

  const results = await ResultModel.find({});
  for (const result of results) {
    result.seasonId = seasons[0]._id;
    result.seasonStartDate = seasons[0].startDate;
    result.seasonEndDate = seasons[0].endDate;
    result.seasonName = seasons[0].name;
    await result.save();
  }

  const clans = await ClanModel.find({});
  for (const clan of clans) {
    clan.seasonId = seasons[0]._id;
    clan.seasonStartDate = seasons[0].startDate;
    clan.seasonEndDate = seasons[0].endDate;
    clan.seasonName = seasons[0].name;
    await clan.save();
  }

  const stats = await StatModel.find({});
  for (const stat of stats) {
    stat.seasonId = seasons[0]._id;
    stat.seasonStartDate = seasons[0].startDate;
    stat.seasonEndDate = seasons[0].endDate;
    stat.seasonName = seasons[0].name;
    await stat.save();
  }

  process.exit();
};

init();
