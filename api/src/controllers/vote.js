const express = require("express");
const router = express.Router();
const passport = require("passport");

const VoteModel = require("../models/vote");
const SeasonModel = require("../models/season");
const ClanModel = require("../models/clan");
const UserModel = require("../models/user");
const { catchErrors } = require("../utils");
const enumVoteType = require("../enums/enumVote");
const enumUserRole = require("../enums/enumUserRole");

router.post(
  "/vote",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.body;

    const vote = await VoteModel.findById(body.voteId);
    if (!vote) return res.status(400).send({ ok: false, message: "Vote not found" });
    
    if (vote.startDate > new Date()) return res.status(400).send({ ok: false, message: "Vote not started" });
    if (vote.endDate < new Date()) return res.status(400).send({ ok: false, message: "Vote ended" });

    const numberOfVotes = vote.votes.filter((v) => v.voterId === req.user._id).length;
    if (numberOfVotes >= vote.maxVotes) return res.status(400).send({ ok: false, message: "Vote limit reached" });

    if (vote.type === enumVoteType.CLAN) {
      const clan = await ClanModel.findById(body.clanId);
      if (!clan) return res.status(400).send({ ok: false, message: "Clan not found" });

      vote.votes.push({
        voterId: req.user._id,
        voterName: req.user.userName,
        clanId: body.clanId,
        clanName: clan.name,
        votedAt: new Date(),
      });
    }

    if (vote.type === enumVoteType.PLAYER) {
      const player = await UserModel.findById(body.playerId);
      if (!player) return res.status(400).send({ ok: false, message: "Player not found" });

      vote.votes.push({
        voterId: req.user._id,
        voterName: req.user.userName,
        playerId: body.playerId,
        playerName: player.userName,
        votedAt: new Date(),
      });
    }

    await vote.save();

    return res.status(200).send({ ok: true, data: { vote: vote.responseModel() } });
  }),
);

router.delete(
  "/vote",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const body = req.query;

    const vote = await VoteModel.findById(body.voteId);
    if (!vote) return res.status(400).send({ ok: false, message: "Vote not found" });
    
    if (vote.startDate > new Date()) return res.status(400).send({ ok: false, message: "Vote not started" });
    if (vote.endDate < new Date()) return res.status(400).send({ ok: false, message: "Vote ended" });

    // Find the specific vote to remove
    let voteIndex = -1;
    
    if (vote.type === enumVoteType.CLAN && body.clanId) {
      voteIndex = vote.votes.findIndex(v => 
        v.voterId.toString() === req.user._id.toString() && v.clanId.toString() === body.clanId
      );
    } else if (vote.type === enumVoteType.PLAYER && body.playerId) {
      voteIndex = vote.votes.findIndex(v => 
        v.voterId.toString() === req.user._id.toString() && v.playerId.toString() === body.playerId
      );
    }

    if (voteIndex === -1) {
      return res.status(400).send({ ok: false, message: "Vote not found or not yours to remove" });
    }

    // Remove the vote
    vote.votes.splice(voteIndex, 1);
    await vote.save();

    return res.status(200).send({ ok: true, data: { vote: vote.responseModel() } });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body.seasonId) obj.seasonId = body.seasonId;

    const votes = await VoteModel.find(obj);
    return res.status(200).send({ ok: true, data: votes.map((v) => v.responseModel()) });
  }),
);

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const currentSeason = await SeasonModel.findOne({ isActive: true });
    if (!currentSeason) return res.status(400).send({ ok: false, message: "No active season" });

    const obj = {
      ...req.body,
      startDate: new Date(),
      type: enumVoteType.PLAYER,
      seasonId: currentSeason._id,
      seasonName: currentSeason.name,
      seasonStartDate: currentSeason.startDate,
      seasonEndDate: currentSeason.endDate,
    };

    const vote = await VoteModel.create(obj);

    return res.status(200).send({ ok: true, data: { vote: vote.responseModel() } });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const body = req.body;

    const vote = await VoteModel.findById(id);
    if (!vote) return res.status(400).send({ ok: false, message: "Vote not found" });

    const obj = {};
    if (body.question) obj.question = body.question;

    if (body.type && body.type !== vote.type && vote.votes.length > 0) return res.status(400).send({ ok: false, message: "Vote already has votes. You can't change the type." });
    if (body.type) obj.type = body.type;

    if (body.maxVotes) obj.maxVotes = body.maxVotes;
    if (body.startDate) obj.startDate = body.startDate;
    if (body.endDate) obj.endDate = body.endDate;

    await vote.updateOne(obj);

    return res.status(200).send({ ok: true, data: { vote: vote.responseModel() } });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const vote = await VoteModel.findById(id);
    if (!vote) return res.status(400).send({ ok: false, message: "Vote not found" });

    await vote.deleteOne();

    return res.status(200).send({ ok: true, message: "Vote deleted" });
  }),
);

module.exports = router;
