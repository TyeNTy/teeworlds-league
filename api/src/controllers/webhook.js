const express = require("express");
const router = express.Router();
const { catchErrors, updateStatResult } = require("../utils");
const { WEBHOOK_TOKEN, WEBHOOK_RANKED_TOKEN } = require("../config");
const { updateAllStatsResultRanked, parseWebhookMessage } = require("../utils/resultRanked");
const { sendFinalResultRankedMessage, deleteResultRanked } = require("../utils/discord");

router.post(
  "/resultRanked/:webhookToken",
  catchErrors(async (req, res) => {
    const { body, params } = req;

    const webhookToken = params.webhookToken;
    if (webhookToken !== WEBHOOK_RANKED_TOKEN) return res.status(200).send();

    res.status(200).send();
    const resMessage = await parseWebhookMessage(body);
    if (!resMessage.ok) {
      console.error(resMessage);
      return;
    }

    const resultRanked = resMessage.data.resultRanked;

    await updateAllStatsResultRanked(resultRanked);
    await deleteResultRanked({ resultRanked });
    await sendFinalResultRankedMessage({ resultRanked });
  }),
);

router.post(
  "/:webhookToken",
  catchErrors(async (req, res) => {
    const { body, params } = req;

    console.log("Webhook received", body);
    console.log("Webhook params", params);

    const webhookToken = params.webhookToken;
    if (webhookToken !== WEBHOOK_TOKEN) return res.status(200).send();

    res.status(200).send();
    const resMessage = await parseWebhookMessage(body);
    console.log(resMessage);
    if (!resMessage.ok) {
      console.error(resMessage);
      return;
    }

    await updateStatResult(resMessage.data.result);
  }),
);

module.exports = router;
