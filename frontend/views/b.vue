<style lang="less" scoped>
.layout {
    max-width: 50em;
    margin: auto;
    width: 100%;
    padding: 10px 2em;
}
.header {
    padding: 0 1em 2em;
}
.content {
    margin: auto;
    display: flex;
}
.book-img {
    flex: 1;
    max-width: 15em;
    text-align: center;
    img {
        width: 100%;
        border: 1px solid #CCC;
    }
}
.book-info {
    flex: 1;
    padding-left: 1.3em;
    .book-title {
        font-size: 1.6em; 
    }
    .book-attrs {
        p {
            display: flex;
        }
        .book-value {
            flex: 1;
        }
        .book-attr {
            font-weight: bold;
            display: inline-block;
            width: 6.5em;
        }
    }
}
@media (max-width: 560px)  {
    .content {
        display: block;
    }
    .book-img {
        margin: 0 auto 1em;
    }
}
</style>
<style lang="less">
#scan-canvas video {
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 400;
}
</style>

<template>
    <Layout class="layout">
        <header class="header">
            <Breadcrumb>
                <BreadcrumbItem to="/">Home</BreadcrumbItem>
                <BreadcrumbItem>Books</BreadcrumbItem>
                <BreadcrumbItem>{{book.name}}</BreadcrumbItem>
            </Breadcrumb>
        </header>
        <Content class="content">
            <section class="book-img">
                <p>
                    <img :src="$root.fileUrl(book.img)" alt="">
                </p>
            </section>
            <section class="book-info">
                <header><h1 class="book-title">{{book.name}}</h1></header>
                <section class="book-attrs">
                    <p>
                        <span class="book-attr">ISBN</span>
                        <span class="">{{book.ISBN}}</span>
                    </p>
                    <p>
                        <span class="book-attr">Author</span>
                        <span class="book-value">{{book.author}}</span>
                    </p>
                    <p>
                        <span class="book-attr">Publisher</span>
                        <span class="book-value">{{book.publisher}}</span>
                    </p>
                    <p>
                        <span class="book-attr">Publish Date</span>
                        <span class="book-value">{{book.pubDate}}</span>
                    </p>
                    <p>
                        <span class="book-attr">Page</span>
                        <span class="book-value">{{book.page}}</span>
                    </p>
                    <p>
                        <span class="book-attr">Reading</span>
                        <span class="book-value">
                            <Progress :percent="readProgress" v-if="book.read.status != 0"/>
                            <span v-if="book.read.status == 0">Not Read yet</span>
                        </span>
                    </p>
                </section>
            </section>
        </Content>
    </Layout>
</template>

<script>
import config from '../../config.json';
import Quagga from 'quagga';

export default {
    data() {
        return {
            book: {
                id: '',
                name: '',
                dbId: '',
                img: '',
                author: '',
                publisher: '',
                page: 1,
                ISBN: '',
                pubDate: ''
            },
            loading: false,
        };
    },
    mounted() {
        this.init();
    },
    destoryed() {
        if(this.isScan) {
            Quagga.stop();
        }
    },
    methods: {
        init () {
            if (this.bookId) {
                this.$store.dispatch('book/get', {
                    id: this.bookId,
                    callback: (rsp, err) => {
                        if (rsp && rsp.state == 0) {
                            this.book = rsp.data;
                            this.$util.title(this.book.name);
                        } else {
                            err = (err && err.message) || rsp.msg;
                            this.$Message.error(err);
                            this.$router.push('/');
                        }
                    }
                })
            } else {
                this.$router.push('/');
            }
        }
    },
    computed: {
        bookImg() {
            let img = this.book.img.indexOf('http') == 0 ? this.book.img : config.file.fileurl + this.book.img;
            return this.book.img ? img : '/img/default.jpg';
        },
        bookId () {
            return this.$route.params.id;
        },
        readProgress() {
            return this.book.read.status == 1 && this.book.read.page < this.book.page ? 
                parseInt(this.book.read.page * 100 / this.book.page) :
                100;
        }
    },
    watch: {
        '$route' (to, from) {
            this.init();
        }
    }
}
</script>
