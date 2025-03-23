const express = require("express");
const router = express.Router();
const passport = require("passport");

const SeasonModel = require("../models/season");
const ClanModel = require("../models/clan");
const UserModel = require("../models/user");
const { catchErrors } = require("../utils");
const enumUserRole = require("../enums/enumUserRole");

router.post(
  "/search",
  catchErrors(async (req, res) => {
    try {
      const seasons = await SeasonModel.find().sort({ startDate: -1 });
      return res.status(200).send({ ok: true, data: seasons });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ ok: false, message: "Error while searching seasons" });
    }
  }),
);

router.post(
  "/endSeason",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    try {
      const currentSeason = await SeasonModel.findOne({ isActive: true });
      if (!currentSeason) {
        return res.status(404).send({ ok: false, message: "No active season found" });
      }

      const currentClans = await ClanModel.find({ seasonId: currentSeason._id });

      const clanRankings = currentClans
        .sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return b.difference - a.difference;
        })
        .map((clan) => clan._id);

      const playerRankings = currentClans
        .flatMap((clan) => clan.players)
        .sort((a, b) => b.elo - a.elo)
        .map((player) => player.userId);

      currentSeason.classementClans = clanRankings;
      currentSeason.classementPlayers = playerRankings;
      currentSeason.isActive = false;
      currentSeason.isLastSeason = true;
      await currentSeason.save();

      return res.status(200).send({
        ok: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ ok: false, message: "Error while ending season" });
    }
  }),
);

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    try {
      const { name, startDate, endDate } = req.body;

      const activeSeason = await SeasonModel.findOne({ isActive: true });
      if (activeSeason) {
        return res.status(400).send({ ok: false, message: "There is already an active season" });
      }

      const lastSeason = await SeasonModel.findOne({ isLastSeason: true });
      if (!lastSeason) {
        return res.status(404).send({ ok: false, message: "No previous season found" });
      }

      const newSeason = await SeasonModel.create({
        name,
        startDate,
        endDate,
        isActive: true,
        isLastSeason: false,
      });

      const previousClans = await ClanModel.find({ seasonId: lastSeason._id });
      let newClans = previousClans.map((clan) => ({
        seasonId: newSeason._id,
        seasonStartDate: newSeason.startDate,
        seasonEndDate: newSeason.endDate,
        seasonName: newSeason.name,
        name: clan.name,
        players: clan.players,
        points: 0,
        numberGames: 0,
        numberWins: 0,
        numberLosses: 0,
        difference: 0,
        winRate: 0,
        averageElo: 0,
      }));

      newClans = await ClanModel.insertMany(newClans);

      for (const clan of newClans) {
        for (const player of clan.players) {
          const user = await UserModel.findOne({ _id: player.userId });
          if (user) {
            user.clanName = clan.name;
            user.clanId = clan._id;
            await user.save();
          }
        }
      }

      lastSeason.isActive = false;
      lastSeason.isLastSeason = false;
      await lastSeason.save();

      return res.status(200).send({
        ok: true,
        data: newSeason,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ ok: false, message: "Error while creating season" });
    }
  }),
);

module.exports = router;
