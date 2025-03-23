export const seasonActions = {
  SET_CURRENT_SEASON: "SET_CURRENT_SEASON",
  SET_SEASONS: "SET_SEASONS",
};

export function setCurrentSeason(season) {
  return { type: seasonActions.SET_CURRENT_SEASON, season };
}

export function setSeasons(seasons) {
  return { type: seasonActions.SET_SEASONS, seasons };
}
