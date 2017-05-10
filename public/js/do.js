vm = new Vue({
    el: '#content',
    data: {
        books : []
    },
    mounted: function() {
        axios.post('/api/book/query', {
            index: 0,
            count: 10
        }, {
            responseType: 'json',
            contentType: "application/json"
        })
        .then(function (response) {
            console.log(response);
            this.books = response.data.data;
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    },
    filters: {
        dblink: function (id) {
            if (!id || isNaN(id)) return ''
            return "http://book.douban.com/subject/" + id + "/";
        }
    }
})