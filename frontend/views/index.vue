<style scoped lang="less">
.layout{
    border-radius: 4px;
    overflow: hidden;
}
.layout-header {
    display: flex;
    background: transparent;
    position: relative;
}
.layout-menu {
    display: flex;
    margin: auto;
    width: 100%;
    background: transparent;
}
.layout-logo{
    justify-content: flex-start;
    align-content: center; 
    width: 40px;
    border-radius: 3px;
    float: left;
    background-size: 100%;
    display: flex;
    img {
        width: 100%;
    }
}
.layout-nav{
    justify-content: flex-end;
    margin: 0 auto;
    margin-right: 0px;
}
.layout-footer{
    p {
        padding: 1em;
        text-align: center;
        width: 100%;
        position: absolute;
        bottom: 0;
        color: #808080;
    }
}
</style>
<template>
    <div class="layout">
        <Layout>
            <Header class="layout-header">
                <Menu mode="horizontal" theme="light" active-name="1" class="layout-menu">
                    <div class="layout-logo">
                        <img src="../assets/logo.svg" alt="我的图书馆" />
                    </div>
                    <div class="layout-nav">
                        <MenuItem name="home">
                            <router-link to="/">
                            <Icon type="ios-navigate"></Icon>
                            首页</router-link>
                        </MenuItem>
                	<MenuItem name="1-0" v-if="!isLogin">
                            <span @click="loginModel = true">
                            <Icon type="person"></Icon>
                            <span>登录</span></span>
                        </MenuItem>
                        <Submenu name="account" v-if="isLogin">
                            <template slot="title">
                                <Icon type="person"></Icon>
                            {{loginUser.nickname}}</template>
                            <MenuItem name="logout">
                                <span @click="logoutAccount"><Icon type="log-out"></Icon>
                   		<span>退出</span></span>
                            </MenuItem>
                        </Submenu>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '10px 50px'}">
                <Layout>
                    <router-view />
                </Layout>
            </Content>
            <Footer class="layout-footer">
                <p>2018 &copy; Hancel</p>
            </Footer>
        </Layout>
	<Modal v-model="loginModel" title="登录" width="300">
            <Form ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
                <FormItem prop="username">
                    <Input type="text" v-model="login.username" placeholder="用户名" @keyup.13="document.getElementById('password').focus()">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="passwd">
                    <Input id="password" :type="passwdType" v-model="login.passwd" placeholder="密码" @keyup.13="loginSubmit('loginForm')">
                        <Icon type="ios-locked-outline" slot="prepend"></Icon>
                        <Button slot="append" :icon="showIcon" @click="isPasswdShow=!isPasswdShow" style="box-shadow:none;" :loading="login_loading"></Button>
                    </Input>
                </FormItem>
            </Form>
            <div slot="footer" class="login-footer">
                <Button type="primary" @click="loginSubmit('loginForm')" :loading="login_loading">登录</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                isCollapsed: false,
                loginModel: false,
                login: {
                    username: '',
                    passwd: ''
                },
                isPasswdShow: false,
                ruleValidate: {
                    username: [
                        { required: true, message: '请输入用户名。', trigger: 'blur' }
                    ],
                    passwd: [
                        { required: true, message: '请输入密码。', trigger: 'blur' },
                    ]
                },
                login_loading: false,
                menuActive: '1-1'
            };
        },
        computed: {
            loginUser () {
                return this.$store.getters.userInfo;
            },
            menuitemClasses () {
                return [
                    'menu-item',
                    this.isCollapsed ? 'collapsed-menu' : ''
                ]
            },
            name () {
                return this.loginUser ? this.loginUser.name : '';
            },
            isLogin () {
                return this.$store.getters.isLogin;
            },
            collapsed() {
                return [
                    this.isCollapsed ? "collapsed" : ""
                ]
            },
            showIcon() {
                return this.isPasswdShow ? 'eye-disabled' : 'eye'
            },
            passwdType () {
                return this.isPasswdShow ? 'text' : 'password'
            },
            compiledMarkdown: function () {
                return this.$marked(this.notes, { sanitize: true })
            }
        },
        mounted () {
        },
        methods: {
            logoutAccount() {
                this.$store.dispatch('logout', (rsp, err) => {
                    if (!rsp || rsp.state != 0) {
                        err = (err && err.message) || rsp.msg
                        this.$Message.error(err);
                    }
                    this.menuActive = '1-1';
                })
            },
            loginSubmit() {
                 this.$refs['loginForm'].validate((valid) => {
                    if (valid) {
                        this.login_loading = true;
                        this.$store.dispatch('login', {
                            user: this.login,
                            callback: (rsp, err) => {
                                this.login_loading = false;
                                if (rsp && rsp.state == 0) {
                                    this.loginModel = false;
                                    this.menuActive = '1-1';
                                } else {
                                    err = (err && err.message) || rsp.msg
                                    this.$Message.error(err);
                                }
                            }
                        })
                    }
                });
            }
        }
    }
</script>