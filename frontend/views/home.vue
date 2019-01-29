<template>
    <div class="index">
        <Dropdown placement="bottom-start" @on-click="switchBooks" v-if="$root.isLogin">
            <a href="javascript:void(0)">
                {{bookType[currentType]}}
                <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list" v-for="(b, i) in bookType" :key="i" >
                <DropdownItem :name="i">{{b}}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        <Content class="layout-content">
            <bookList :params="query" v-if="$root.isLogin"/>
        </Content>
    </div>
</template>
<script>
    import axios from 'axios';
    import bookList from '../components/book-list.vue'
    export default {
        components: {
            bookList
        },
        mounted() {
            this.init();
        },
        methods: {
            switchBooks(type) {
                this.currentType = type;
            },
            init() {
            }
        },
        data() {
            return {
                currentType: 0,
            };
        },
        computed: {
            bookType() {
                return [
                    'All',
                    'Reading',
                    'Lent'
                ]
            },
            query () {
                return {
                    name: this.$route.params.word ? `%${this.$route.params.word}%` : undefined
                };
            }
        },
        watch: {
            '$router': (to, from) => {
                this.init()
            }
        }
    };
</script>
<style lang="less">
</style>