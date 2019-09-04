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
.book-content {
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
.note-header {
    padding-left: 1.3em;
    h2 {
        font-size: 1.3em;
        margin: 1em 0 0;
    }
}
.note-list {
    list-style: none;
    padding: 0;
    .note-item {
        margin: 0 0 1em;
        details {
            &[open] {
                background-color: #f3f3f3;
                border-radius: .5em;
            }
            summary {
                padding: .5em;
            }
            section {
                padding: .5em 1.5em;
            }
        }
    }
}

@media (max-width: 560px)  {
    .book-content {
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
            <article class="book-content">
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
                                <Progress :percent="readProgress" v-if="book.read.status != 0" :title="readPage"/>
                                <span v-if="book.read.status == 0">Not Read yet</span>
                            </span>
                        </p>
                    </section>
                </section>
            </article>
            <article class="note-content">
                <header class="note-header"><h2>Notes <Icon custom="fa fa-plus" @click="isNote=true" v-if="book.userId == $root.loginUser.id"/></h2></header>
                <ul class="note-list">
                    <li v-for="n in notes" class="note-item">
                        <details>
                            <summary>[Page {{n.page}}] {{n.section||'No Section'}}</summary>
                            <section class="markdown-preview" v-html="compiledMarkdown(n.content)"></section>
                        </details>
                    </li>
                </ul>
                <section style="text-align:center" v-if="notes.length == 0">
                    No Notes yet.
                </section>
                <bookNote :book="book" v-model="isNote" @change="notesChange" :fullscreen="false"/>
            </article>
        </Content>
    </Layout>
</template>

<script>
import config from '../../config.json';
import bookNote from '../components/book-note';

export default {
    components: {
        bookNote
    },
    data() {
        return {
            book: {
                id: '',
                userId: '',
                name: '',
                dbId: '',
                img: '',
                author: '',
                publisher: '',
                page: 1,
                ISBN: '',
                pubDate: '',
                read: {}
            },
            loading: false,
            notes: [],
            isNote: false
        };
    },
    mounted() {
        this.init();
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
                this.loadNotes(this.bookId);
            } else {
                this.$router.push('/');
            }
        },
        loadNotes(id) {
            this.$store.dispatch('note/get', {
                id,
                callback: (rsp, err) => {
                    if (rsp && rsp.state == 0) {
                        this.notes = [];
                        rsp.data.forEach(d => this.notes.push(d))
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                    }
                }
            })
        },
        compiledMarkdown (notes) {
            return this.$marked(notes, { sanitize: true })
        },
        notesChange(notes) {
            this.notes = [];
            notes.forEach(n => this.notes.push(n));
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
        readPage () {
            return this.book.read.page < this.book.page ? this.book.read.page : this.book.page;
        },
        readProgress() {
            return parseInt(this.readPage * 100 / this.book.page)
        }
    },
    watch: {
        '$route' (to, from) {
            this.init();
        }
    }
}
</script>
