vm = new Vue({
    el: '#content',
    data: {
        books : []
    },
    methods: {
        handleScroll () {
            if (document.body.scrollTop >= document.body.scrollHeight - window.innerHeight - 5) 
                this.getdata();
        },
        getdata: function (query) {
            query = query || {};
            query.index = query.index || this.books.length;
            query.count = query.count || 10;
            axios.post('/api/book/query', query, {
                responseType: 'json',
                contentType: "application/json"
            })
            .then(function (response) {
                console.log(response);
                this.books = this.books.concat(response.data.data);
            }.bind(this))
            .catch(function (error) {
                console.log(error);
            });
        }
    },
    mounted: function() {
        this.getdata();
        window.addEventListener('scroll', this.handleScroll);
    },
    filters: {
        dblink: function (id) {
            if (!id || isNaN(id)) return ''
            return "http://book.douban.com/subject/" + id + "/";
        },
        readstate: function(state) {
            if (isNaN(state)) state = 0;
            var read = ["看了点", "还没看", "看完了"]
            return read[parseInt(state) + 1];
        },
        lendstate: function(state) {
            if (isNaN(state)) state = 0;
            var lend = ["不外借", "没人借", "被借了"];
            return lend[parseInt(state) + 1];
        },
        lendtitle: function(state) {
            if (isNaN(state)) state = 0;
            var title = ["", "想借這本書？", ""];
            return title[parseInt(state) + 1];
        }
    }
})


