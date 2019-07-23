<style lang="less" scoped>
.form-title {
    display: flex;
    .form-page {
        flex: 200px 1;
    }
    .form-section {
        width: 100%
    }
}
.note-list {
    li {
        border-bottom: 1px dashed #ccc;
        padding: 10px 0;
    }
}
.note-view {
    h1 {
        font-size: 2em;
        .view-back {
            font-size: .8em;
            padding-right: .2em;
            color: #D21C13;
      }
    }
    .markdown-preview {
        font-size: 1.3em;
    }
}
</style>
<template>
    <Modal 
        v-model="modal" 
        :fullscreen="fullscreen" 
        :title="title" 
        :mask-closable="false"
        @on-visible-change="change">
        <section v-if="book.name">
            <Tabs type="card" v-model="notetab">
                <TabPane name="note" label="笔记" icon="logo-markdown">
                    <Form ref="noteForm" :model="note" :rules="ruleValidate" inline>
                        <section class="form-title">
                            <FormItem class="form-page" prop="page" label="页码">
                                <InputNumber ref="page" v-model="note.page" placeholder="页码" :min="1" :step="10" :precision="0"/>
                            </FormItem>
                            <FormItem class="form-section" prop="section" label="章节名">
                                <Input type="text" v-model="note.section" placeholder="章节名" style="width: calc(100% - 4em)" />
                            </FormItem>
                        </section>
                        <FormItem prop="content" style="width: 100%">
                            <Input v-model="note.content" type="textarea" placeholder="笔记（支持 markdown）" 
                            :autosize="{ minRows: 5, maxRows: 15 }" size="default"/>
                        </FormItem>
                    </Form>
                </TabPane>
                <TabPane name="preview" label="预览" icon="md-eye">                
                    <section class="markdown-preview" v-html="compiledMarkdown(note.content)"></section>
                </TabPane>
                <TabPane name="history" label="历史" icon="md-list" v-if="notes.length">
                    <ul class="note-list" v-show="!isView">
                        <li v-for="n in notes">
                            <a href="javascript:void(0)" @click="viewNote(n)">[Page {{n.page}}] {{n.section||'No Section'}}</a>
                        </li>
                    </ul>
                    <article v-if="isView" class="note-view">
                        <header>
                            <h1>
                                <i class="fa fa-chevron-left view-back" aria-hidden="true" @click="isView=false"></i>
                                <span class="title">[Page {{noteView.page}}] {{noteView.section||'No Section'}}</span>
                            </h1>
                        </header>
                        <section class="markdown-preview" v-html="compiledMarkdown(noteView.content)"></section>
                    </article>
                </TabPane>
            </Tabs>
        </section>
        <div slot="footer" class="login-footer">
            <Button type="primary" :loading="loading" @click="handleNew">New</Button>
        </div>
    </Modal>
</template>
<script>
export default {
    props: {
        book: {
            type: Object,
            required: true
        },
        value: {
            type: Boolean,
            required: true
        }
    },
    data(){
        return {
            isView: false,
            fullscreen: true,
            modal: false,
            notesInput: '',
            loading: false,
            notes: [],
            notetab: 'note',
            note: {
                id: '',
                bookId: '',
                ISBN: '',
                page: 0,
                section: '',
                content: '',
                favcount: 0
            },
            noteView: {
                id: '',
                bookId: '',
                ISBN: '',
                page: 0,
                section: '',
                content: '',
                favcount: 0
            }
        };
    },
    watch: {
        value(val) {
            if (this.modal != val) 
                this.modal = val;
        },
        book(book) {
            if (!book.id) return;
            console.log(book)
            this.note.bookId = book.id;
            this.note.ISBN = book.ISBN;
            if (book.read.status == 1) {
                this.note.page = book.read.page;
            }
            this.loadNotes(this.note.bookId);
        },
        modal(val) {
            if (this.modal != val) {
                this.$emit("input", val);
            }
        }
    },
    computed: {
        title() {
            return this.book.name + '的笔记';
        },
        ruleValidate() {
            return {
                content: [
                    { required: true, message: '笔记不能为空', trigger: 'blur' },
                    { type: 'string', min: 10, message: '笔记不能少于10个字', trigger: 'blur' }
                ]
            }
        }
    },
    mounted() {
        this.modal = this.value;
        if (this.book.id) {
            this.note.bookId = this.book.id;
            this.note.ISBN = this.book.ISBN;
            if (this.book.read.statue == 1) {
                this.note.page = this.book.read.page;
            }
            this.loadNotes(this.note.bookId);
        }
    },
    methods: {
        viewNote(n) {
            this.noteView = n;
            this.isView = true;
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
        handleNew() {
            this.$refs['noteForm'].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.$store.dispatch('note/insert', {
                        note: this.note,
                        callback: (rsp, err) => {
                            this.loading = false;
                            if (rsp && rsp.state == 0) {
                                this.$Message.success(`New Note Success!`);
                                this.notes.push(rsp.data);
                                this.note.content = '';
                                this.notetab = 'history';
                            } else {
                                err = (err && err.message) || rsp.msg;
                                this.$Message.error(err);
                            }
                        }
                    })
                }
            })
        },
        compiledMarkdown (notes) {
            return this.$marked(notes, { sanitize: true })
        },
        change (val) {
            this.$emit("input", val);
        }
    }
}
</script>
