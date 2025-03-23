import { seasonActions } from "./actions";

const initState = {
  currentSeason: null,
  seasons: [],
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case seasonActions.SET_CURRENT_SEASON:
      return { ...state, currentSeason: action.season };
    case seasonActions.SET_SEASONS:
      return { ...state, seasons: action.seasons };
    default:
      return state;
  }
}
