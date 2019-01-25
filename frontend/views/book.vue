<style lang="less" scoped>
.layout {
    max-width: 35em;
    margin: auto;
    width: 100%;
}
.header {
    padding: 0 1em 2em;
}
.content {
    display: flex; 
}
.book-img {
    max-width: 11em;
    flex: 1;
    text-align: center;
    img {
        width: 100%;
    }
}
.book-form {
    flex: 1;
    padding-left: .6em;
}
</style>

<template>
    <Layout class="layout">
        <header class="header">
            <Breadcrumb>
                <BreadcrumbItem to="/">Home</BreadcrumbItem>
                <BreadcrumbItem>New</BreadcrumbItem>
            </Breadcrumb>
        </header>
        <Content class="content">
            <section class="book-img">
                <p>
                    <img :src="bookImg" alt="">
                </p>
                <Upload 
                    :show-upload-list="false"
                    :action="uploadInterface"
                    :on-success="handleSuccess"
                    :max-size="maxSize"
                    :format="['jpg','jpeg','png']"
                    :on-format-error="handleFormatError"
                    :on-exceeded-size="handleMaxSize"
                    >
                    <Button icon="ios-cloud-upload-outline">Upload files</Button>
                </Upload>
            </section>
            <Form class="book-form" ref="bookForm" :model="book" :rules="ruleValidate" :label-width="100">
                <FormItem label="ISBN" prop="ISBN" required>
                    <Input v-model="book.ISBN" placeholder="ISBN" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Book Name" prop="name" required>
                    <Input v-model="book.name" placeholder="Book Name" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Author" prop="author">
                    <Input v-model="book.author" placeholder="Author" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Publisher" prop="publisher">
                    <Input v-model="book.publisher" placeholder="Publisher" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Publish Date" prop="pubDate">
                    <DatePicker type="month" v-model="book.pubDate" format="yyyy-MM" placeholder="Publish Date" size="default"></DatePicker>
                </FormItem>
                <FormItem label="Page Number" prop="page" required>
                    <InputNumber v-model="book.page" :min="1" placeholder="Page" size="default"/>
                </FormItem>
                <FormItem>
                    <Button type="primary" @click="handleSubmit" :loading="loading">Submit</Button>
                </FormItem>
            </Form>
        </Content>
    </Layout>
</template>

<script>
import env from '../config/env';
import config from '../../config.json';

export default {
    data() {
        return {
            book: {
                name: '',
                dbid: '',
                img: '',
                author: '',
                publisher: '',
                page: 1,
                ISBN: '',
                pubDate: ''
            },
            loading: false
        };
    },
    mounted() {

    },
    methods: {
        handleSubmit() {

        },
        handleSuccess (res, file) {
            let rsp = file.response;
            if (rsp.state == 0)
                this.$set(this.book, 'img', rsp.data[0]);
            else {
                this.$Notice.warning({
                    title: 'Upload File Failed',
                    desc: rsp.msg
                });
            }
        },
        handleFormatError (file) {
            this.$Notice.warning({
                title: 'The file format is incorrect',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        handleMaxSize (file) {
            this.$Notice.warning({
                title: 'Exceeding file size limit',
                desc: 'File  ' + file.name + ' is too large, no more than 2M.'
            });
        }
    },
    computed: {
        bookImg() {
            return this.book.img ? config.file.fileurl + this.book.img : '/img/default.jpg';
        },
        maxSize() {
            return config.file.maxSize * 1024;
        },
        ruleValidate() {
            return {}
        },
        uploadInterface() {
            return '/api/lib/upload';
        }
    }
}
</script>
