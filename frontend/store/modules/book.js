import axios from 'axios';

var state = {
};

const mutations = {
};

const actions = {
    insert ({ commit }, { book, callback}) {
        axios.post('/book/new', book)
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