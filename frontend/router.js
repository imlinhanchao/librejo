const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: (resolve) => require(['./views/index.vue'], resolve),
    beforeRouteEnter(to, from, next) {
        if(!this.$root.loginUser) {
            to = '/';
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
        path: '*',
        redirect: '/'
    }
];
export default routers;