const express = require("express");
const router = express.Router();

const ResultRankedModel = require("../models/resultRanked");
const {
  catchErrors,
} = require("../utils");

router.post(
  "/search",
  catchErrors(async (req, res) => {
    const obj = {};

    const results = await ResultRankedModel.find(obj, null, { sort: { date: -1 } });
    return res.status(200).send({ ok: true, data: results.map((result) => result.responseModel()) });
  }),
);

module.exports = router;
