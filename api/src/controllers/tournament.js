const express = require("express");
const router = express.Router();
const passport = require("passport");

const TournamentModel = require("../models/tournament");
const { catchErrors } = require("../utils");
const enumUserRole = require("../enums/enumUserRole");

router.post(
  "/",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const createObj = {};

    const tournament = await TournamentModel.create(createObj);
    if (!tournament) return res.status(400).send({ ok: false, message: "Error while creating tournament" });

    return res.status(200).send({ ok: true, data: tournament.responseModel() });
  }),
);

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const tournament = await TournamentModel.findById(req.params.id);
    if (!tournament) return res.status(400).send({ ok: false, message: "Tournament not found" });

    return res.status(200).send({ ok: true, data: tournament.responseModel() });
  }),
);

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const body = req.body;

    const obj = {};
    if (body._id) obj._id = body._id;
    if (body.status) obj.status = body.status;

    const tournaments = await TournamentModel.find(obj);
    return res.status(200).send({ ok: true, data: tournaments.map((t) => t.responseModel()) });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const tournament = await TournamentModel.findById(req.params.id);
    if (!tournament) return res.status(400).send({ ok: false, message: "Tournament not found" });

    const body = req.body;
    const updateObj = {};
    if (body.name) updateObj.name = body.name;
    if (body.description) updateObj.description = body.description;
    if (body.description === "") updateObj.description = null;
    if (body.startDate) updateObj.startDate = body.startDate;
    if (body.endDate) updateObj.endDate = body.endDate;
    if (body.registrationStartDate) updateObj.registrationStartDate = body.registrationStartDate;
    if (body.registrationEndDate) updateObj.registrationEndDate = body.registrationEndDate;
    if (body.numberOfServers) updateObj.numberOfServers = body.numberOfServers;
    if (body.twitchUrls) updateObj.twitchUrls = body.twitchUrls;
    if (body.numberOfPlayersPerTeam) updateObj.numberOfPlayersPerTeam = body.numberOfPlayersPerTeam;
    if (body.stages) updateObj.stages = body.stages;

    tournament.set(updateObj);
    await tournament.save();

    return res.status(200).send({ ok: true, data: tournament.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const tournament = await TournamentModel.findById(req.params.id);
    if (!tournament) return res.status(400).send({ ok: false, message: "Tournament not found" });

    await tournament.deleteOne();

    return res.status(200).send({ ok: true });
  }),
);

module.exports = router;
