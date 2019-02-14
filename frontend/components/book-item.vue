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
                right: 0;
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
.read-form {
    position: absolute;
    background: #FFFFFF;
    top: 3em;
    right: .5em;
    z-index: 100;
    padding: .5em;
    color: #000;
    border-radius: .5em;
    .ivu-spin {
        border-radius: .5em;
    }
    p {
        margin: 1em 0;
    }
    .close-read {
        margin-left: -.5em;
    }
}
.separator {
    position: absolute;
    margin: auto;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 5px 6px 5px;
    border-color: transparent transparent #FFF;
    top: -.3em;
    right: 1em;
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
                    <Button shape="circle" type="text" title="Read" class="read" @click="isRead = true">
                        <Icon :custom="`fa ${readIcon}`"></Icon>
                    </Button>
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
                            <Button shape="circle" type="text" title="Delete" :loading="removeloading"><Icon custom="fa fa-trash"></Icon></Button>
                        </Poptip>
                    </Col>
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Notes"><Icon type="md-quote"></Icon></Button>
                    </Col>
                </Row>
                <section class="read-form" v-if="isRead">
                    <span class="separator"></span>
                    <section>
                        <Button class="close-read" type="text" icon="md-close" size="large" @click="isRead = false"></Button>
                        <RadioGroup v-model="readInfo.status" type="button">
                            <Radio :label="0">
                                <Poptip trigger="hover" content="Not Read" transfer>
                                    <Icon custom="fa fa-star-o" />
                                </Poptip>
                            </Radio>
                            <Radio :label="1" title="Reading" @click="$refs['page'].focus()">
                                <Poptip trigger="hover" content="Reading" transfer>
                                    <Icon custom="fa fa-star-half-o" />
                                </Poptip>
                            </Radio>
                            <Radio :label="2" title="Have Read">
                                <Poptip trigger="hover" content="Have Read" transfer>
                                    <Icon custom="fa fa-star" />
                                </Poptip>
                            </Radio>
                        </RadioGroup>
                    </section>
                    <Form>
                        <Button v-if="readInfo.status!=1" long type="primary" 
                        @click="ReadEvent" :disabled="readInfo.status==read.status">Save</Button>
                        <FormItem label="Page" v-show="readInfo.status==1" style="margin-bottom:0">
                            <InputNumber ref="page" v-model="readInfo.page" :min="0" :step="10" :precision="0"/>
                            <Button type="primary" @click="ReadEvent" :disabled="readInfo.page==read.page && read.status==1">Save</Button>
                        </FormItem>
                    </Form>
                    <Spin size="large" fix v-if="readloading"></Spin>
                </section>
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
        },
        read: {
            type: Object,
            required: true
        }
    },
    components: {
    },
    data () {
        return {
            readInfo: {
                status: 0,
                page: 0,
                bookId: '',
                ISBN: ''
            },
            isRead: false,
            removeloading: false,
            readloading: false,
        }
    },
    mounted () {
        this.readInfo = Object.assign({}, this.read);
        if (!this.readInfo.ISBN) {
            this.readInfo.ISBN = this.book.ISBN;
        }
    },
    computed: {
        readIcon () {
            let icon = ['fa-star-o', 'fa-star-half-o', 'fa-star'];
            return icon[this.read.status];
        }
    },
    methods: {
        ReadEvent() {
            this.readloading = true;
            this.$store.dispatch('book/read', {
                read: this.readInfo,
                callback: (rsp, err) => {
                    this.readloading = false;
                    if (rsp && rsp.state == 0) {
                        this.$Message.success(`Change Book Status Success!`);
                        this.$emit('reads', this.readInfo);
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                    }
                }
            })
        },
        deleteEvent() {
            this.removeloading = true;
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
