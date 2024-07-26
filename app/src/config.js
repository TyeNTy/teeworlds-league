const ENVIRONMENT = getEnvironment();

let API_URL = "http://localhost:8080"; // update me !
if (ENVIRONMENT === "production") API_URL = "https://api.gctfleague.org"; // update me !

const SENTRY_URL = ""; // update me !

function getEnvironment() {
  if (
    window.location.href.indexOf("localhost") !== -1 ||
    window.location.href.indexOf("127.0.0.1") !== -1
  )
    return "development";
  return "production";
}

export { API_URL, SENTRY_URL, ENVIRONMENT };
