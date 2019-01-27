const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: (resolve) => require(['./views/index.vue'], resolve),
    props: { loginPage: false },
    beforeRouteEnter(to, from, next) {
        if(!this.$root.loginUser) {
            to = '/login';
            next();
        }
    },
    children: [
        {
            path: '',
            meta: {
                title: 'Home'
            },
            component: (resolve) => require(['./views/home.vue'], resolve)
        },
        {
            path: 'book/new',
            meta: {
                title: 'New Book'
            },
            component: (resolve) => require(['./views/book.vue'], resolve)
        },
        {
            path: 'book/:id',
            meta: {
                title: 'Update Book'
            },
            component: (resolve) => require(['./views/book.vue'], resolve)
        }

    ]
    }, {
        path: '/login',
        meta: {
            title: 'Login'
        },
        component: (resolve) => require(['./views/index.vue'], resolve),
        props: { loginPage: true }
    },{
        path: '*',
        redirect: '/'
    }
];
export default routers;