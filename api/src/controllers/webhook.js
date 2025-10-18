const express = require("express");
const router = express.Router();
const { catchErrors, updateStatResult } = require("../utils");
const { WEBHOOK_TOKEN, WEBHOOK_RANKED_TOKEN } = require("../config");
const { updateAllStatsResultRanked, parseWebhookMessage, deleteResultRankedDiscord } = require("../utils/resultRanked");
const WebhookModel = require("../models/webhooks");
const { discordMessageResultRanked } = require("../utils/discordMessages");
const discordService = require("../services/discordService");

router.post(
  "/resultRanked/:webhookToken",
  catchErrors(async (req, res) => {
    const { params } = req;
    let body = req.body;

    const obj = {
      action: "resultRanked",
      body: JSON.stringify(body),
    };
    const webhook = await WebhookModel.create(obj);

    const webhookToken = params.webhookToken;
    if (webhookToken !== WEBHOOK_RANKED_TOKEN) return res.status(200).send();

    const sanitizedContent = body.content.replace(/[\\\n\t]/g, "");

    webhook.body = sanitizedContent;
    await webhook.save();

    const content = JSON.parse(sanitizedContent);

    res.status(200).send();
    const resMessage = await parseWebhookMessage(content);
    if (!resMessage.ok) {
      webhook.ok = false;
      webhook.endpointResult = JSON.stringify(resMessage);
      await webhook.save();
      return;
    }

    const resultRanked = resMessage.data.resultRanked;

    const resUpdateAllStatsResultRanked = await updateAllStatsResultRanked(resultRanked);
    if (!resUpdateAllStatsResultRanked.ok) {
      webhook.ok = false;
      webhook.endpointResult = JSON.stringify(resUpdateAllStatsResultRanked);
      await webhook.save();
      return;
    }
    const resDeleteResultRanked = await deleteResultRankedDiscord({ resultRanked });
    if (!resDeleteResultRanked.ok) {
      webhook.ok = false;
      webhook.endpointResult = JSON.stringify(resDeleteResultRanked);
      await webhook.save();
      return;
    }

    if (resultRanked.guildId) {
      const discordMessage = await discordMessageResultRanked({ resultRanked });
      await discordService.sendMessage({
        channelId: resultRanked.textChannelDisplayFinalResultId,
        ...discordMessage,
      });
    }

    webhook.ok = true;
    await webhook.save();
  }),
);

router.post(
  "/:webhookToken",
  catchErrors(async (req, res) => {
    const { body, params } = req;

    const obj = {
      action: "result",
      body: JSON.stringify(body),
    };
    const webhook = await WebhookModel.create(obj);

    const webhookToken = params.webhookToken;
    if (webhookToken !== WEBHOOK_TOKEN) return res.status(200).send();

    res.status(200).send();
    const resParseWebhookMessage = await parseWebhookMessage(body);
    if (!resParseWebhookMessage.ok) {
      webhook.ok = false;
      webhook.endpointResult = JSON.stringify(resParseWebhookMessage);
      await webhook.save();
      console.error(resParseWebhookMessage);
      return;
    }

    const resUpdateStatResult = await updateStatResult(resParseWebhookMessage.data.result);
    if (!resUpdateStatResult.ok) {
      webhook.ok = false;
      webhook.endpointResult = JSON.stringify(resUpdateStatResult);
      await webhook.save();
      return;
    }
  }),
);

module.exports = router;
