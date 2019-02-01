<style lang="less" scoped>
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
        position: relative;
        .avatar {
            flex: auto;
            background: #FFF;
            overflow: hidden;
            border-radius: 100%;
            max-width: 128px;
            height: 128px;
            position: relative;
            img {
                width: 100%;
                display: block;
                z-index: 1;
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto;
            }
            &:hover .avatar-upload{
                display: block;
            }
            .avatar-upload {
                display: none;
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                top: 0;
                z-index: 3;
                .upload-btn {
                    height: 100%;
                    width: 100%;
                    &:hover {
                        background: #00000030;
                    }
                }
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
                font-size: 1em;
            }
        }
    }
}
.layout-content {
    padding: 10px 2em;
}
</style>
<style lang="less">
.avatar-upload {
    .ivu-upload {
        height: 100%;
        background: #00000030;
        border: 0;
        &:hover {
            border: 0;
        }
    }
}
</style>
<template>
    <div class="index">
        <Content class="profile">
            <section class="section">
                <div v-if="info.id" class="avatar">
                    <img :src="$root.fileUrl(info.avatar, '/img/user.png')">
                    <Upload v-if="$root.isLogin && $root.loginUser.id == info.id" class="avatar-upload"
                        :show-upload-list="false"
                        :action="$root.uploadInterface"
                        :on-success="handleSuccess"
                        :max-size="$root.maxSize"
                        :format="['jpg','jpeg','png', 'gif']"
                        :on-format-error="$root.fileFormatError"
                        :on-exceeded-size="$root.fileMaxSize"
                        type="drag"
                    >
                        <Button class="upload-btn" type="text">
                            <Icon type="ios-cloud-upload" size="30"></Icon>
                        </Button>
                    </Upload>
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
    import config from '../../config.json';
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
            },
            handleSuccess (res, file) {
                let rsp = file.response;
                if (rsp.state == 0) {
                    this.$set(this.info, 'avatar', rsp.data[0]);
                    this.$store.dispatch('account/set', {
                        info: this.info,
                        callback: (rsp, err) => {
                            if (rsp && rsp.state == 0) {
                                this.$Message.success(`Update Avatar Success!`);
                            } else {
                                err = (err && err.message) || rsp.msg;
                                this.$Message.error(err);
                            }
                        }
                    })
                }
                else {
                    this.$Notice.warning({
                        title: 'Upload File Failed',
                        desc: rsp.msg
                    });
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
            avatar() {
                let img = this.info.avatar.indexOf('http') == 0 ? this.info.avatar : config.file.fileurl + this.info.avatar;
                return this.info.avatar ? img : '/img/user.png';
            },
            uploadInterface() {
                return '/api/lib/upload';
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