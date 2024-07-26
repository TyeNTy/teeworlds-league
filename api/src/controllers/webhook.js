const express = require("express");
const router = express.Router();
const { catchErrors, parseWebhookMessage, updateStatResult } = require("../utils");
const { WEBHOOK_TOKEN } = require("../config");

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
    if (!resMessage.ok) {
      console.error(resMessage);
      return;
    }

    await updateStatResult(resMessage.data.result);
  }),
);

module.exports = router;
