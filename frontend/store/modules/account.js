import axios from 'axios';

var state = {
    loginUser: null
};
const mutations = {
    setLoginUser(state, user) {
        state.loginUser = user;
    }
};
const actions = {
    login({ state, commit }, { user, callback }) {
        axios.post('/account/login', user)
            .then((rsp) => {
                rsp = rsp.data;
                if (rsp.state == 0) {
                    commit('setLoginUser', rsp.data);
                }
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    logout({ commit }, callback) {
        axios.get('/account/logout')
            .then((rsp) => {
                rsp = rsp.data;
                if (rsp.state == 0) {
                    commit('setLoginUser', null);
                }
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    checklogin({ commit }, callback) {
        axios.get('/account/info')
            .then((rsp) => {
                rsp = rsp.data;
                if (rsp.state == 0) {
                    commit('setLoginUser', rsp.data);
                }
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    getInfo({ commit }, { username, callback }) {
        axios.post('/account/query', { username })
            .then((rsp) => {
                rsp = rsp.data;
                callback(rsp);
            })
            .catch((error) => {
                console.error(error.message);
                callback(null, error);
            });
    }
};
const getters = {
    isLogin: (state) => {
        return !!state.loginUser;
    },
    info: (state) => {
        return state.loginUser;
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};