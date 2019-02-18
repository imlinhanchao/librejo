<style lang="less" scoped>
.loading {
    position: relative;
    height: 2em;
    div {
        background: transparent;
    }
}
</style>
<template>
    <Layout>
        <waterfall 
            align="center"
            :line-gap="300"
            :min-line-gap="100"
            :max-line-gap="220"
            :single-max-width="500"
            :watch="books"
            @reflowed="reflowed"
            ref="waterfall">
            <!-- each component is wrapped by a waterfall slot -->
            <waterfall-slot
                v-for="(item, index) in books"
                :width="item.width"
                :height="item.height"
                :order="index"
                :key="item.index"
                move-class="item-move"
                class="book"
            >
                <bookItem :book="item.book" :read="item.book.read" @remove="removeBook" @reads="readBook" @notes="noteBook"/>
            </waterfall-slot>
        </waterfall>
        <p style="color: #AAA; text-align:center;" v-if="!loading && total && total == books.length">--- No More Books ---</p>
        <p style="color: #AAA; text-align:center;" v-if="!loading && total == 0 && $root.isLogin">You must <router-link to="/book/new">add</router-link> your book first.</p>
        <p v-show="loading" class="loading"><Spin fix></Spin></p>
        <bookNote :book="bookModal" v-model="isNote" />
    </Layout>
</template>
<script>
import Waterfall from 'vue-waterfall/lib/waterfall';
import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';
import bookItem from './book-item';
import bookNote from './book-note';
export default {
    props: {
        params: {
            type: Object,
        }
    },
    components: {
        Waterfall,
        WaterfallSlot,
        bookItem,
        bookNote
    },
    data () {
        return {
            books: [],
            timestamp: new Date().valueOf(),
            total: 0,
            lastRequest: 0,
            loading: false,
            bookModal: {
                name: '',
                id: ''
            },
            isNote: false
        }
    },
    mounted () {
        this.query(0, this.params);
        window.addEventListener('scroll', this.scrollEvent);
    },
    destroyed() {
        window.removeEventListener('scroll', this.scrollEvent);
    },
    watch: {
        params(val) {
            this.books = [];
            this.query(0, val);
        }
    },
    methods: {
        query(index, query) {
            this.loading = true;
            let lastRequest = new Date().valueOf();
            this.lastRequest = lastRequest;
            this.$store.dispatch('book/query', {
                index,
                query: Object.assign({ 
                    create_time: this.timestamp,
                    userId: this.$root.loginUser.id
                }, query || {}),
                callback: (rsp, err) => {
                    if (this.lastRequest != lastRequest) return;
                    if (rsp && rsp.state == 0) {
                        rsp.data.data.forEach(d => {
                            let img = new Image();
                            img.onload = () => {
                                this.books.push({
                                    width: img.width,
                                    height: img.height,
                                    book: d,
                                });
                                this.loading = false;
                            }
                            img.src = '/upload/' + d.img;
                        })
                        this.total = rsp.data.total;
                        if (!this.total) this.loading = false;
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                        this.loading = false;
                    }
                }
            })
        },
        reflowed () {
            this.isBusy = false
        },
        addBooks () {
            if (!this.isBusy && this.books.length < this.total) {
                this.isBusy = true;
                this.query(this.books.length);
            }
        },
        scrollEvent() {
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (scrollTop + window.innerHeight >= document.body.clientHeight - 5) {
                this.addBooks && this.addBooks();
            }
        },
        removeBook(id) {
            this.total -= 1;
            this.books = this.books.filter(b => b.book.id != id);
        },
        readBook(read) {
            let index = this.books.findIndex(b => b.book.id == read.bookId);
            this.$set(this.books[index].book, 'read', read);
        },
        noteBook(book) {
            this.bookModal = book;
            this.isNote = true;
        }
    }
}
</script>
