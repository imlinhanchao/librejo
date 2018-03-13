const routers = [{
    path: '/',
    meta: {
        title: ''
    },
    component: (resolve) => require(['./views/index.vue'], resolve),
    children: [
        {
            path: '',
            meta: {
                title: '首页'
            },
            component: (resolve) => require(['./views/home.vue'], resolve)
        },
    ]
}];
export default routers;