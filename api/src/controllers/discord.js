const express = require("express");
const router = express.Router();
const passport = require("passport");

const enumUserRole = require("../enums/enumUserRole");
const { catchErrors } = require("../utils");
const discordService = require("../services/discordService");

router.get(
  "/getBotInviteUrl",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resBotInviteUrl = await discordService.getBotInviteUrl();
    if (!resBotInviteUrl.ok) return res.status(500).send(resBotInviteUrl);

    return res.status(200).send(resBotInviteUrl);
  }),
);

router.get(
  "/guilds",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const resGuilds = await discordService.getGuilds();
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

module.exports = router;
