export const strict = false;

export const state = () => ({
    user: null,
    isAdmin: false,
    authenticating: true // hide login page when firebase auth is checking
});

export const getters = {
    userID(state) {
        return state.user ? state.user.uid : ""
    }
}

export const mutations = {
    SET_ADMIN(state, val) {
        state.isAdmin = val
    },
    RESET_STORE(state) {
        state.user = null;
    },
    ON_AUTH_STATE_CHANGED_MUTATION(state, { authUser }) {
        const { uid, email, emailVerified } = authUser
        state.user = { uid, email, emailVerified }
    },
    CHANGE_AUTHENTICATING_STATE(state, newVal) {
        state.authenticating = newVal
    }
}


export const actions = {
    onAuthStateChangedAction({ commit }, authUser) {

        if (authUser) {
            console.log("SET USER")
            // Do something with the authUser and the claims object...
            commit('ON_AUTH_STATE_CHANGED_MUTATION', { authUser })

        } else {
            console.log("CLEAR USER")
            // Perform logout operations

            commit('RESET_STORE')

        }
    }
};