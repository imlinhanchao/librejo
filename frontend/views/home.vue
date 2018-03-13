<template>
    <div class="index">
        <Content class="layout-content">
            <waterfall
                :align="align"
                :line-gap="300"
                :min-line-gap="100"
                :max-line-gap="220"
                :single-max-width="500"
                :watch="items"
                @reflowed="reflowed"
                ref="waterfall"
            >
                <!-- each component is wrapped by a waterfall slot -->
                <waterfall-slot
                v-for="(item, index) in items"
                :width="item.width"
                :height="item.height"
                :order="index"
                :key="item.index"
                move-class="item-move"
                >
                <div class="item" :index="item.index">
                    <div class="panel">
                        <img :src="item.img" alt="">
                        <p><a :href="item.href">{{item.name}}</a></p>
                    </div>
                </div>
                </waterfall-slot>
            </waterfall>
        </Content>
    </div>
</template>
<script>
    import Waterfall from 'vue-waterfall/lib/waterfall';
    import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';
    import axios from 'axios';
    export default {
        components: {
            Waterfall,
            WaterfallSlot
        },
        mounted() {
            this.getbook(0);
            document.body.addEventListener('click', () => {
                app.shuffle();
                // app.$refs.waterfall.$emit('reflow') // manually trigger reflow action
            }, false);
            window.addEventListener('scroll', () => {
                let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                if (scrollTop + window.innerHeight >= document.body.clientHeight) {
                    this.addItems();
                }
            });
        },
        methods: {
            handleStart() {
                this.$Modal.info({
                    title: '首页',
                    content: '图书列表'
                });
            },
            getbook(index, count=10) {
                axios.post('/api/book/query', {index: index, count: count})
                .then((rsp) => {
                    rsp = rsp.data;
                    if (rsp.state == 0) {
                        this.total = rsp.data.total;
                        rsp.data.data.forEach((d) => { 
                            let img = new Image();
                            img.onload = () => {
                                this.items.push({
                                    width: img.width,
                                    height: img.height,
                                    name: d.name,
                                    id: d.id,
                                    img: d.img,
                                    href: `https://book.douban.com/subject/${d.dbid}/`
                                });
                            }
                            img.src = d.img;
                        });
                    } else {
                        this.$Message.error(rsp.msg);
                    }
                })
                .catch((error) => {
                    this.$Message.error(error.message);
                });
            },
            addItems: function () {
                if (!this.isBusy && this.items.length < this.total) {
                    this.isBusy = true
                    this.getbook(this.items.length);
                }
            },
            shuffle: function () {
                this.items.sort(function () {
                  return Math.random() - 0.5
                })
            },
            reflowed: function () {
                this.isBusy = false
            }
        },
        data() {
            return {
                items: [],
                total: 0,
                align: 'center',
                isBusy: false
            };
        }
    };
</script>
<style lang="less">
.item-move {
    transition: all .5s cubic-bezier(.55,0,.1,1);
    -webkit-transition: all .5s cubic-bezier(.55,0,.1,1);
}
.item {
    padding: .4em;
    img {
        width: 100%;
        display: block;
    }
    p {
        text-align: center;
        position: absolute;
        bottom: 0;
        top: 0;
        width: 100%;
        margin: auto;
        font-size: 2.5em;
        color: #FFF;
        background: rgba(0, 0, 0, .6);
        width: 100%;
        display: table;
        a {
            display: table-cell;
        }
    }
    .panel {
        border-radius: 1em;
        overflow: hidden;
        position: relative;
        box-shadow: #a1a2a3 2px 2px 4px;
    }
}
</style>