import axios from 'axios';

var state = {
};

const mutations = {
};

const actions = {
    insert ({ commit }, { note, callback}) {
        axios.post('/note/new', note)
            .then((rsp) => {
                rsp = rsp.data;
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    set ({ commit }, { note, callback}) {
        axios.post('/note/set', note)
            .then((rsp) => {
                rsp = rsp.data;
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    remove ({ commit }, { id, callback }) {
        axios.post('/note/del', { id })
            .then((rsp) => {
                rsp = rsp.data;
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    get ({ commit }, { id, callback}) {
        axios.get('/note/get/' + id)
            .then((rsp) => {
                rsp = rsp.data;
                callback(rsp);
            })
            .catch((error) => {
                callback(null, error);
                console.error(error.message);
            });
    },
    query ({ commit }, { index, count = 10, query = {}, callback}) {
        axios.post('/note/query/', {
            index, count, query
        })
        .then((rsp) => {
            rsp = rsp.data;
            callback(rsp);
        })
        .catch((error) => {
            callback(null, error);
            console.error(error.message);
        });
    }
};

const getters = {
};

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};