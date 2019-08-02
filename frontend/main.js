import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import App from './app.vue';
import store from './store';
import 'iview/dist/styles/iview.css';
import './theme/index.less';
import axios from 'axios';
import marked from 'marked';
import config from '../config.json';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = Util.ajaxUrl;
Vue.prototype.$axios = axios;
Vue.prototype.$marked = marked;
Vue.prototype.$util = Util;

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(iView);

// 路由配置
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
    data: {
    },
    beforeMount() {
    },
    methods: {
        fileFormatError (file) {
            this.$Notice.warning({
                title: 'The file format is incorrect',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        fileMaxSize (file) {
            this.$Notice.warning({
                title: 'Exceeding file size limit',
                desc: 'File  ' + file.name + ' is too large, no more than 2M.'
            });
        },
        fileUrl (name, defaults = '/img/default.jpg') {
            let img = name.indexOf('http') == 0 ? name : config.file.fileurl + name;
            return name ? img : defaults;
        },
        accessCheck(route) {
            if (!this.$store.getters['account/isLogin'] 
              && route.path != '/'
              && !['/u/', '/login'].find(p => route.path.indexOf(p) == 0)) {
                return false;
            }
            return true;
        }
    },
    computed: {
        maxSize() {
            return config.file.maxSize * 1024;
        },
        uploadInterface() {
            return '/api/lib/upload';
        },
        loginUser() {
            return this.isLogin ? this.$store.getters['account/info'] : {};
        },
        name() {
            return this.loginUser ? this.loginUser.nickname : '';
        },
        isLogin() {
            return this.$store.getters['account/isLogin'];
        }
    }
});
