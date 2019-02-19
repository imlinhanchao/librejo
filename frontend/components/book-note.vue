<style lang="less" scoped>

</style>
<template>
    <Modal 
        v-model="modal" 
        :fullscreen="fullscreen" 
        :title="title" 
        :mask-closable="false"
        @on-visible-change="change">
        <section v-if="book.name">
            <Tabs type="card">
                <TabPane label="笔记" icon="logo-markdown">
                    <Input v-model="notesInput" type="textarea" placeholder="支持 markdown。" 
                    :autosize="{ minRows: 5, maxRows: 15 }" size="default"/>
                </TabPane>
                <TabPane label="预览" icon="md-eye">                
                    <section class="markdown-preview" v-html="compiledMarkdown(notesInput)"></section>
                </TabPane>
            </Tabs>
        </section>
        <div slot="footer" class="login-footer">
            <Button type="primary">New</Button>
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
            fullscreen: false,
            modal: false,
            notesInput: ''
        };
    },
    watch: {
        value(val) {
            if (this.modal != val) 
                this.modal = val;
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
        }
    },
    mounted() {
        this.modal = this.value;
    },
    methods: {
        compiledMarkdown (notes) {
            return this.$marked(notes, { sanitize: true })
        },
        change (val) {
            this.$emit("input", val);
        },
    }
}
</script>
