const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const PORT = process.env.PORT || 8080;
const MONGODB_ENDPOINT = (process.env.MONGODB_ENDPOINT = "mongodb://localhost:27017/teeworlds-league");
const SECRET = process.env.SECRET || "not-so-secret";
const SENTRY_DSN = process.env.SENTRY_DSN;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL_USER = process.env.EMAIL_USER || "emqil";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "token";
const EMAIL_URL = process.env.ENMAIL_URL || "smtp-relay.sendinblue.com";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "WEBHOOK_TOKEN";

const CONFIG = {
  ENVIRONMENT,
  PORT,
  MONGODB_ENDPOINT,
  SECRET,
  SENTRY_DSN,
  APP_URL,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_URL,
  WEBHOOK_TOKEN,
};

if (ENVIRONMENT === "development") console.log(CONFIG);

module.exports = CONFIG;
