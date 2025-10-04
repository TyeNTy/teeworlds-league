const express = require("express");
const router = express.Router();
const passport = require("passport");

const enumUserRole = require("../enums/enumUserRole");
const { catchErrors } = require("../utils");
const discordService = require("../services/discordService");
const DiscordTokenModel = require("../models/discordToken");
const QueueModel = require("../models/queue");
const { APP_URL } = require("../config");

router.get(
  "/getActivationCodeUrl",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resActivationCodeUrl = await discordService.getActivationCodeUrl();
    if (!resActivationCodeUrl.ok) return res.status(500).send(resActivationCodeUrl);

    return res.status(200).send(resActivationCodeUrl);
  }),
);

router.get(
  "/activateCode",
  passport.authenticate(enumUserRole.GUEST, { session: false }),
  catchErrors(async (req, res) => {
    const discordActivationCode = req.query.code;

    const resActivateCode = await discordService.getTokenFromCode({ code: discordActivationCode });
    if (!resActivateCode.ok) return res.status(500).send(resActivateCode);

    const expiresAt = new Date(Date.now() + resActivateCode.data.expires_in * 1000);

    const discordToken = await DiscordTokenModel.create({
      accessToken: resActivateCode.data.access_token,
      expiresAt: expiresAt,
      refreshToken: resActivateCode.data.refresh_token,
    });

    return res.redirect(`${APP_URL}/ranked/queues?codeSuccess=true`);
  }),
);

router.get(
  "/guilds",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resClient = await discordService.createClient();
    if (!resClient.ok) return res.status(500).send(resClient);

    const client = resClient.data.client;
    const resGuilds = await discordService.getGuilds({ client });
    if (!resGuilds.ok) return res.status(500).send(resGuilds);

    const guilds = Array.from(resGuilds.data.guilds.values()).map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      memberCount: guild.memberCount,
    }));

    return res.status(200).send({ ok: true, data: guilds });
  }),
);

router.put(
  "/queue/:queueId/guild",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { queueId } = req.params;
    const { guildId } = req.body;

    if (!guildId) {
      return res.status(400).send({ ok: false, error: "guildId is required" });
    }

    const resClient = await discordService.createClient();
    if (!resClient.ok) return res.status(500).send(resClient);

    const client = resClient.data.client;
    const resGuilds = await discordService.getGuilds({ client });
    if (!resGuilds.ok) return res.status(500).send(resGuilds);

    const guilds = resGuilds.data.guilds;
    if (!guilds.has(guildId)) {
      return res.status(400).send({ ok: false, error: "Guild not found or bot not in guild" });
    }

    // Update the queue with the guild ID
    const queue = await QueueModel.findByIdAndUpdate(queueId, { guildId }, { new: true });

    if (!queue) {
      return res.status(404).send({ ok: false, error: "Queue not found" });
    }

    return res.status(200).send({ ok: true, data: queue.responseModel() });
  }),
);

module.exports = router;
