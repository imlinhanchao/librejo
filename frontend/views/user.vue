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
    background: #f6f6f6;
    margin: 1em 0;
    padding: 1em 2em;
    .section {
        max-width: 35em;
        display: flex;
        margin: auto;
        .avatar {
            flex: auto;
            background: #FFF;
            overflow: hidden;
            border-radius: 100%;
            max-width: 128px;
            img {
                width: 100%;
                display: block;
            }
        }
        .info {
            flex: 1;
            padding: 0 2em;
            .nickname {
                font-size: 2em;
            }
            .lastlogin {
                color: #CCC;
                font-size: .5em;
            }
            .motte {
                font-size: 1.5em;
            }
        }
    }
}
.layout-content {
    padding: 10px 2em;
}

</style>
<template>
    <div class="index">
        <Content class="profile">
            <section class="section">
                <div v-if="info.id" class="avatar">
                    <img :src="info.avatar || '/img/user.png'">
                </div>
                <div class="info">
                    <p class="nickname">{{info.nickname}}</p>
                    <p class="lastlogin">{{new Date(info.lastlogin * 1000).toLocaleString()}}</p>
                    <p class="motte">{{info.motte || 'Nothing to say.'}}</p>
                </div>
            </section>
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