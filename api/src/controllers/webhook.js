const express = require("express");
const router = express.Router();
const { catchErrors, parseWebhookMessage, updateStatResult } = require("../utils");
const { parseQueueWebhookMessage, updateStatResultRanked } = require("../utils/resultRanked");
const { WEBHOOK_TOKEN, QUEUE_RESULTS_WEBHOOK_TOKEN } = require("../config");

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

router.post(
  "/queue/:webhookToken",
  catchErrors(async (req, res) => {
    const { body, params } = req;

    console.log("Queue webhook received", body);
    console.log("Queue webhook params", params);

    const webhookToken = params.webhookToken;
    if (webhookToken !== QUEUE_RESULTS_WEBHOOK_TOKEN) return res.status(200).send();

    res.status(200).send();
    const resMessage = await parseQueueWebhookMessage(body);
    console.log(resMessage);
    if (!resMessage.ok) {
      console.error(resMessage);
      return;
    }

    await updateStatResultRanked(resMessage.data.result);
  }),
);

module.exports = router;
