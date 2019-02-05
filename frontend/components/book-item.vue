<style lang="less" scoped>
.book {
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
            .read {
                position: absolute;
                right: .2em;
                bottom: -.2em;
                width: 2em;
                height: 2em;
                border-radius: 1em;
                background: #00000066;
                text-align: center;
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
        }
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
                color: #FFF;
                &:hover {
                    background: #27272766;
                    color: #D21C13;
                }
            }
        }
        .ivu-poptip {
            color: #000;
            text-align: left;
        }
    }
}
.read-pop {
    right: -.3em;
    position: absolute;
    bottom: -2.5em;
}
@media (max-width: 480px)  {
    .book {
        .info {
            font-size: 150%;
        }
    }
}
</style>
<template>
    <section class="book" :index="book.index">
        <div class="panel">
            <div class="thum"><img :src="'/upload/' + book.img" alt=""></div>
            <div class="info">
                <div class="header form-item">
                    <span class="title" :title="book.name"><router-link :to="'/b/' + book.id">{{book.name}}</router-link></span>
                    <Poptip placement="bottom-end" class="read-pop"
                            >
                        <Button shape="circle" type="text" title="Read" class="read"><Icon custom="fa fa-bookmark-o"></Icon></Button>
                        <section slot="content">
                            <RadioGroup v-model="status" type="button" size="large">
                                <Radio label="Begin" :value="1"></Radio>
                                <Radio label="Ing" :value="2"></Radio>
                                <Radio label="Ed" :value="3"></Radio>
                            </RadioGroup>
                        </section>
                    </Poptip>
                </div>
                <Row class="footer" type="flex" justify="space-between">
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Borrow"><Icon type="md-hand"></Icon></Button>
                    </Col>
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Edit" @click="$router.push(`/book/${book.id}`)"><Icon custom="fa fa-pencil"></Icon></Button>
                    </Col>
                    <Col span="5" class="form-item">
                        <Poptip
                            confirm
                            title="Are you sure you want to remove this book?"
                            @on-ok="deleteEvent">
                            <Button shape="circle" type="text" title="Delete"><Icon custom="fa fa-trash"></Icon></Button>
                        </Poptip>
                    </Col>
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Notes"><Icon type="md-quote"></Icon></Button>
                    </Col>
                </Row>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        book: {
            type: Object,
            required: true
        }
    },
    components: {
    },
    data () {
        return {
            status: 0
        }
    },
    mounted () {
    },
    methods: {
        deleteEvent() {
            this.$store.dispatch('book/remove', {
                id: this.book.id,
                callback: (rsp, err) => {
                    this.removeloading = false;
                    if (rsp && rsp.state == 0) {
                        this.$Message.success(`Remove Book Success!`);
                        this.$emit('remove', this.book.id);
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                    }
                }
            })
        }
    }
}
</script>
