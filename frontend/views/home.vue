<template>
    <div class="index">
        <Dropdown placement="bottom-start" @on-click="switchBooks">
            <a href="javascript:void(0)">
                {{bookType[currentType]}}
                <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list" v-for="(b, i) in bookType" :key="i" >
                <DropdownItem :name="i">{{b}}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        <Content class="layout-content">
            <bookList />
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
        },
        methods: {
            switchBooks(type) {
                this.currentType = type;
            }
        },
        data() {
            return {
                items: [],
                total: 0,
                align: 'center',
                isBusy: false,
                currentType: 0
            };
        },
        computed: {
            bookType() {
                return [
                    'All',
                    'Reading',
                    'Lent'
                ]
            }
        }
    };
</script>
<style lang="less">
</style>