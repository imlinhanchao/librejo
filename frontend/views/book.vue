<style lang="less" scoped>
.layout {
    max-width: 35em;
    margin: auto;
    width: 100%;
    padding: 10px 2em;
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
.pend-btn {
    padding-left: 8px;
    padding-right: 8px;
}
button.delete-btn {
    background: #515a6e;
    border-color: #c5c8ce;
    &:hover {
        background: #808695;
    }

    &:focus {
        box-shadow: none;
    }
}
.fullscreen {
    position: fixed;
    left: -1px;
    right: -1px;
    top: -1px;
    bottom: -1px;
    z-index: 100;
    background: #000;
    #scan-canvas {
        position: absolute;
        max-width: 480px;
        max-height: 800px;
        height: 100%;
        width: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .close-btn {
        position: absolute;
        top: .5em;
        right: .5em;
        color: #FFF;
        font-size: 1.5em;
        z-index: 500;
        &:hover {
            background: transparent;
        }
    }
}
.comp-section {
    position: absolute;
    z-index: 100;
    background: #FFF;
    border: 1px solid #CCC;
    border-top: 0;
    width: 100%;
    padding-top: .5em;
    .comp-list {
        list-style: none;
        .comp-item {
            padding: 0 .5em;
            &:hover {
                background: #EEE;
            }
            a {
                display: flex;
                .comp-img {
                    padding-right: .5em;
                    img {
                        width: 30px;
                    }
                }
                .comp-content {
                    flex: 1;
                    width: calc(100% - 40px);
                    p {
                        display: flex;
                        padding: 0;
                        line-height: 1.8;
                        span {
                            &.comp-title {
                                color: #D21C13;
                                overflow: hidden;
                                text-overflow:ellipsis;
                                white-space: nowrap;
                                display: inline-block;
                                flex: 1;
                            }
                            &.comp-pubdate {
                                width: 4em;
                                text-align: right;
                                color: #999;
                            }
                        }
                        &.comp-author {
                            display: block;
                            overflow: hidden;
                            text-overflow:ellipsis;
                            white-space: nowrap;
                            width: 100%;
                            color: #999;
                        }
                    }
                }
            }
        }
    }
}
@media (max-width: 480px)  {
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
                <BreadcrumbItem v-if="!isUpdate">New</BreadcrumbItem>
                <BreadcrumbItem v-if="isUpdate">Update</BreadcrumbItem>
                <BreadcrumbItem v-if="isUpdate">{{book.name}}</BreadcrumbItem>
            </Breadcrumb>
        </header>
        <Content class="content">
            <section class="book-img">
                <p>
                    <img :src="$root.fileUrl(book.img)" alt="">
                </p>
                <Upload 
                    :show-upload-list="false"
                    :action="$root.uploadInterface"
                    :on-success="handleSuccess"
                    :max-size="$root.maxSize"
                    :format="['jpg','jpeg','png']"
                    :on-format-error="$root.fileFormatError"
                    :on-exceeded-size="$root.fileMaxSize"
                    >
                    <Button icon="ios-cloud-upload-outline">Upload files</Button>
                </Upload>
            </section>
            <Form class="book-form" ref="bookForm" :model="book" :rules="ruleValidate" :label-width="100">
                <FormItem label="ISBN" prop="ISBN" required>
                    <Input autofocus v-model="book.ISBN" v-if="!isUpdate" :disabled="isUpdate" placeholder="ISBN" :maxlength="200" size="default">
                        <Button slot="prepend" class="pend-btn" icon="md-qr-scanner" @click="handleScan" v-if="$root.isWx"/>
                        <Button slot="append" class="pend-btn" icon="ios-search" @click="search"/>
                    </Input>
                    <span v-if="isUpdate" >{{book.ISBN}}</span>
                </FormItem>
                <FormItem label="Book Name" prop="name" required>
                    <Input v-model="book.name" placeholder="Book Name" :maxlength="200" size="default" @on-change="handleName" @on-blur="this.books = []"/>
                    <section v-if="!isUpdate && this.books.length" class="comp-section">
                        <ul class="comp-list">
                            <li v-for="b in books" class="comp-item">
                                <a href="javascript:void(0)" @click="handleSearch(b)">
                                    <div class="comp-img"><img :src="$root.dbImg(b.images.small)" :alt="b.title" rel="noreferrer" referrerpolicy ="never"></div>
                                    <div class="comp-content">
                                        <p>
                                            <span class="comp-title">{{b.title}}</span>
                                            <span class="comp-pubdate">{{b.pubdate.split('-')[0].slice(0, 4) || ''}}</span>
                                        </p>
                                        <p class="comp-author">{{b.author[0] || ''}}</p>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </section>
                </FormItem>
                <FormItem label="Author" prop="author">
                    <Input v-model="book.author" placeholder="Author" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Publisher" prop="publisher">
                    <Input v-model="book.publisher" placeholder="Publisher" :maxlength="200" size="default"/>
                </FormItem>
                <FormItem label="Publish Date" prop="pubDate">
                    <DatePicker type="month" v-model="yearMonth" format="yyyy-MM" placeholder="Publish Date" size="default"></DatePicker>
                </FormItem>
                <FormItem label="Page Number" prop="page" required>
                    <InputNumber v-model="book.page" :min="1" placeholder="Page" size="default"/>
                </FormItem>
                <FormItem>
                    <Button type="primary" v-if="!isUpdate" @click="handleSubmit" :loading="loading">Submit</Button>
                    <Button type="primary" v-if="isUpdate" @click="handleUpdate" :loading="loading">Update</Button>
                    <Button type="primary" class="delete-btn" v-if="isUpdate" @click="handleRemove" :loading="removeloading">Remove</Button>
                </FormItem>
            </Form>
        </Content>
    </Layout>
</template>

<script>
import config from '../../config.json';

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
            books: [],
            loading: false,
            removeloading: false,
            isUpdate: false,
            isScan: false,
            isWxConfig: false
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init () {
            if (this.bookId) {
                this.isUpdate = true;
                this.$store.dispatch('book/get', {
                    id: this.bookId,
                    callback: (rsp, err) => {
                        if (rsp && rsp.state == 0) {
                            this.book = rsp.data;
                            this.$util.title('Update Book ' + this.book.name);
                        } else {
                            err = (err && err.message) || rsp.msg;
                            this.$Message.error(err);
                            this.$router.push('/book/new');
                        }
                    }
                })
            } else {
                this.isUpdate = false;
                if (this.isbn) {
                    this.book.ISBN = this.isbn;
                    this.search();
                }
            }
            this.$refs['bookForm'].resetFields();
        },
        handleSearch(book) {
            this.$router.replace('/book/new/' + book.isbn13);
            this.books = [];
        },
        handleName () {
            if (this.isUpdate || this.book.name == '') return;
            this.$axios.post('/douban/query/', {
                q: this.book.name,
                index: 0,
                count: 5
            })
                .then((rsp) => {
                    rsp = rsp.data;
                    let data = rsp.data;
                    if (rsp.state == 0) {
                        this.books = rsp.data.books;
                    }
                })
                .catch((error) => {
                    this.$Message.error(error.message);
                    console.error(error);
                });
        },
        handleUpdate() {
            this.loading = true;
            this.$store.dispatch('book/set', {
                book: this.book,
                callback: (rsp, err) => {
                    this.loading = false;
                    if (rsp && rsp.state == 0) {
                        this.$Message.success(`Update Book Success!`);
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                    }
                }
            })
        },
        handleRemove() {
            this.removeloading = true;
            this.$store.dispatch('book/remove', {
                id: this.book.id,
                callback: (rsp, err) => {
                    this.removeloading = false;
                    if (rsp && rsp.state == 0) {
                        this.$Message.success(`Remove Book Success!`);
                        this.$router.push('/book/new');
                        this.isUpdate = false;
                        this.$refs['bookForm'].resetFields();
                    } else {
                        err = (err && err.message) || rsp.msg;
                        this.$Message.error(err);
                    }
                }
            })
        },
        handleSubmit() {
            this.$refs['bookForm'].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.$store.dispatch('book/insert', {
                        book: this.book,
                        callback: (rsp, err) => {
                            this.loading = false;
                            if (rsp && rsp.state == 0) {
                                this.$Message.success(`New Book Success!`);
                                this.$router.replace('/book/' + rsp.data.id);
                                this.book = rsp.data;
                                this.isUpdate = true;
                            } else {
                                err = (err && err.message) || rsp.msg;
                                this.$Message.error(err);
                            }
                        }
                    })
                }
            })
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
        handleScan () {
            this.$root.registerWx(['scanQRCode'], () => {
                this.scanCode();
            });
        },
        scanCode () {
            this.$root.wx.scanQRCode({
                needResult: 1, 
                scanType: ["qrCode","barCode"], 
                success: (res) => {
                    var isbn = res.resultStr.split(',').slice(-1).join('');
                    this.book.ISBN = isbn;
                    this.search();
                },
                error: function(res){
                    this.$Message.error(res.errMsg);
                }
            });
        },
        search() {
            if (this.book.ISBN == '') return;
            this.$axios.get('/douban/isbn/' + this.book.ISBN)
                .then((rsp) => {
                    rsp = rsp.data;
                    let data = rsp.data;
                    if (rsp.state == 0) {
                        this.book = {
                            img: data.images.large.replace('view/subject/l/public', 'lpic'),
                            name: data.title,
                            dbId: data.id,
                            author: data.author[0] || '',
                            publisher: data.publisher,
                            page: parseInt(data.pages),
                            ISBN: data.isbn13,
                            pubDate: ''
                        };
                        this.yearMonth = new Date(data.pubdate.replace(/年/, '-').replace(/月/, ''));
                    } else {
                        this.$Message.error('ISBN not found.');
                    }
                })
                .catch((error) => {
                    this.$Message.error(error.message);
                    console.error(error);
                });
        }
    },
    computed: {
        bookImg() {
            let img = this.book.img.indexOf('http') == 0 ? this.book.img : config.file.fileurl + this.book.img;
            return this.book.img ? img : '/img/default.jpg';
        },
        ruleValidate() {
            return {}
        },
        yearMonth: {
            get() {
                return this.book.pubDate ? new Date(this.book.pubDate + '-01') : '';
            },
            set(month) {
                if (month.getFullYear)
                    this.$set(this.book, 'pubDate', month.getFullYear() + '-' + ('0' + (month.getMonth() + 1)).slice(0, 2));
            }
        },
        bookId () {
            return this.$route.params.id;
        },
        isbn () {
            return this.$route.params.isbn;
        }
    },
    watch: {
        isUpdate(val) {
            if(!val) {
                this.book = {
                    id: '',
                    name: '',
                    dbId: '',
                    img: '',
                    author: '',
                    publisher: '',
                    page: 1,
                    ISBN: '',
                    pubDate: ''
                };
            }
        },
        '$route' (to, from) {
            this.init();
        }
    }
}
</script>
