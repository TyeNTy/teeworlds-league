require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const fs = require("fs");
const initCron = require("./cron/intCron");

const { PORT, SENTRY_DSN, ENVIRONMENT, APP_URL } = require("./config");
const app = express();

if (ENVIRONMENT === "development") {
  app.use(morgan("tiny"));
}

require("./mongo");
require("./passport")(app);

app.use(cors({ credentials: true, origin: [APP_URL] }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const lastDeployedAt = new Date();
app.get("/", async (req, res) => {
  res.status(200).send({
    name: "api",
    environment: ENVIRONMENT,
    last_deployed_at: lastDeployedAt.toLocaleString(),
  });
});

app.use("/user", require("./controllers/user"));
app.use("/clan", require("./controllers/clan"));
app.use("/result", require("./controllers/result"));
app.use("/stat", require("./controllers/stat"));
app.use("/webhook", require("./controllers/webhook"));
app.use("/season", require("./controllers/season"));
app.use("/event", require("./controllers/event"));
app.use("/vote", require("./controllers/vote"));
app.use("/queue", require("./controllers/queue"));

if (ENVIRONMENT === "production") {
  var https = require("https");
  var http = require("http");

  var options = {
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
  };

  https.createServer(options, app).listen(443);
} else {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

initCron();

