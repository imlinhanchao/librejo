<style lang="less">
.loading {
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 2em;
}
.profile {
    display: flex;
    .avatar {
        flex: 1;
        img {
            width: 100%;
            border-radius: 100%;
        }
    }
    .info {
        flex: 2;
    }
}
</style>
<template>
    <div class="index">
        <Content class="profile">
            <div v-if="info.id" class="avatar">
                <img :src="info.avatar || '/img/user.png'">
            </div>
            <div class="info"></div>
        </Content>
        <Content class="layout-content">
            <bookList :params="query" v-if="info.id"/>
        </Content>
        <p v-show="!info.id" class="loading"><Spin fix></Spin></p>
    </div>
</template>
<script>
    import axios from 'axios';
    import bookList from '../components/book-list.vue'
    export default {
        components: {
            bookList,
        },
        mounted() {
            this.init();
        },
        methods: {
            switchBooks(type) {
                this.currentType = type;
            },
            init() {
                if (this.$route.params.user == '') {
                    this.$Message.error('Username couldn\'t be empty.')
                    this.$router.push('/')
                } else {
                    this.$store.dispatch('account/getInfo', {
                        username: this.$route.params.user,
                        callback: (rsp, err) => {
                            if(rsp.data.total)
                                this.info = rsp.data.data[0];
                            else {
                                this.$Message.error('Username was not exist.')
                                this.$router.push('/')
                            }
                        }
                    })
                }
            }
        },
        data() {
            return {
                info: {
                    id: '',
                    username: '',
                    nickname: '',
                    avatar: '',
                    motto: '',
                    lastLogin: 0,
                }
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
                    userId: this.info.id || ''
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