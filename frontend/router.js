const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: (resolve) => require(['./views/index.vue'], resolve),
    props: { loginPage: false },
    beforeRouteEnter(to, from, next) {
        if(!this.$store.getters['account/isLogin'] && to.path.indexOf('/u/')) {
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
            path: 's/:word',
            meta: {
                title: 'Search'
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
            path: 'book/new/:isbn',
            meta: {
                title: 'New Book'
            },
            component: (resolve) => require(['./views/book.vue'], resolve)
        },
        {
            path: 'b/:id',
            meta: {
                title: 'Book Information'
            },
            component: (resolve) => require(['./views/b.vue'], resolve)
        },
        {
            path: 'book/:id',
            meta: {
                title: 'Update Book'
            },
            component: (resolve) => require(['./views/book.vue'], resolve)
        }, {
            path: 'u/:user',
            meta: {
                title: 'User'
            },
            component: (resolve) => require(['./views/user.vue'], resolve),
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