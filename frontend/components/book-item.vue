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
</style>
<template>
    <section class="book" :index="book.index">
        <div class="panel">
            <div class="thum"><img :src="'/upload/' + book.img" alt=""></div>
            <div class="info">
                <div class="header">
                    <span class="title" :title="book.name">{{book.name}}</span>
                    <router-link :to="'/b/' + book.id" class="fa fa-arrow-right link"></router-link>
                </div>
                <Row class="footer" type="flex" justify="space-between">
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Borrow"><Icon type="md-hand"></Icon></Button>
                    </Col>
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Edit" @click="$router.push(`/book/${book.id}`)"><Icon custom="fa fa-pencil"></Icon></Button>
                    </Col>
                    <Col span="5" class="form-item">
                        <Button shape="circle" type="text" title="Delete"><Icon custom="fa fa-trash"></Icon></Button>
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
        }
    },
    mounted () {
    },
    methods: {

    }
}
</script>
