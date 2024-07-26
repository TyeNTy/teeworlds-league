import enumUserRole from "../../enums/enumUserRole";
import { authActions } from "./actions";

const initState = {
    user: null,
};

export default function reducer(state = initState, action) {
    switch (action.type) {
        case authActions.SETUSER:
            if (action.user && action.user.role === enumUserRole.ADMIN)
                action.user.isAdmin = true;
            return { ...state, user: action.user };
        default:
            return state;
    }
}