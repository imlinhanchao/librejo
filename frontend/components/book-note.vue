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

        </section>
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
            modal: false
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
        change (val) {
            this.$emit("input", val);
        },
    }
}
</script>
