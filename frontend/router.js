const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: (resolve) => require(['./views/index.vue'], resolve),
    props: { loginPage: false },
    beforeRouteEnter(to, from, next) {
        if(!this.$root.accessCheck(to) && to.route.path != '/') {
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
            path: 'book/:id',
            meta: {
                title: 'Update Book'
            },
            component: (resolve) => require(['./views/book.vue'], resolve)
        },
        {
            path: 'u/:user',
            meta: {
                title: 'User'
            },
            component: (resolve) => require(['./views/user.vue'], resolve),
        },
        {
            path: 'detail/:id',
            meta: {
                title: 'Book Information'
            },
            component: (resolve) => require(['./views/detail.vue'], resolve)
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