<style lang="less" scoped>
.book
{
    .item {
        position: relative;
        padding: .6em;
        .panel {
            border-radius: .6em;
            box-shadow: #00000033 0 4px 10px;
            overflow: hidden;
            position: relative;
            img {
                width: 100%;
                display: block;
            }
            &:hover .info{
                display: block;
            }

        }
        .info {
            display: none;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background: #0000004d;
            color: #FFF;
            .header {
                position: absolute;
                top: .5em;
                right: .5em;
                left: .5em;
                .link {
                    position: absolute;
                    right: 0;
                    width: 2em;
                    height: 2em;
                    border-radius: 1em;
                    background: #00000066;
                    text-align: center;
                    line-height: 1.9em;
                    transform: rotate(-45deg);
                }
                .title {
                    position: absolute;
                    left: 0;
                    right: 2.5em;
                    height: 2em;
                    border-radius: 1em;
                    background: #00000066;
                    padding: 0 .6em;
                    font-weight: bold;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
            }
            .footer {
                position: absolute;
                bottom: .5em;
                right: .5em;
                left: .5em;
                .form-item {
                    text-align: center;
                    button {
                        padding: 0;
                        display: inline-block;
                        height: 2em;
                        width: 2em;
                        color: inherit;
                        font-size: 1.2em;
                        text-align: center;
                        line-height: 0em;
                        background: #00000066;
                        &:hover {
                            background: #27272766;
                            color: #D21C13;
                        }
                    }
                }
            }
        }
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
                <bookItem :book="item.book" />
            </waterfall-slot>
        </waterfall>
        <p style="color: #AAA; text-align:center;" v-if="total && total == books.length">--- No More Books ---</p>
        <p style="color: #AAA; text-align:center;" v-if="total == 0 && $store.getters['account/isLogin']">You must <router-link to="/book/new">add</router-link> your book first.</p>
    </Layout>
</template>
<script>
import Waterfall from 'vue-waterfall/lib/waterfall';
import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';
import bookItem from './book-item';
export default {
    components: {
        Waterfall,
        WaterfallSlot,
        bookItem
    },
    data () {
        return {
            books: [],
            timestamp: new Date().valueOf(),
            total: 0
        }
    },
    mounted () {
        this.query(0);
        window.addEventListener('scroll', this.scrollEvent);
    },
    destroyed() {
        window.removeEventListener('scroll', this.scrollEvent);
    },
    methods: {
        query(index, name) {
            if (!this.$store.getters['account/isLogin']) return;
            this.$store.dispatch('book/query', {
                index,
                query: { 
                    name, 
                    create_time: this.timestamp,
                    userId: this.$store.getters['account/info'].id
                },
                callback: (rsp, err) => {
                    this.loading = false;
                    if (rsp && rsp.state == 0) {
                        rsp.data.data.forEach(d => {
                            let img = new Image();
                            img.onload = () => {
                                this.books.push({
                                    width: img.width,
                                    height: img.height,
                                    book: d,
                                });
                            }
                            img.src = '/upload/' + d.img;
                        })
                        this.total = rsp.data.total;
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
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
            if (scrollTop + window.innerHeight >= document.body.clientHeight) {
                this.addBooks && this.addBooks();
            }
        }
    }
}
</script>
