<style scoped lang="less">
.layout {
    border-radius: 4px;
    background: transparent;
}
.layout-header {
    display: flex;
    background: transparent;
    position: relative;
    padding: 0 2em;
}
.layout-search {
    justify-content: flex-start;
    flex: 1;
}
.layout-logo {
    justify-content: center;
    height: 100%;
    flex: auto;
    text-align: center;
    img {
        height: 60%;
        margin: 5% 0;
    }
}
.layout-side {
    justify-content: flex-end;
    display: flex;
    flex: 1;
}
.layout-avatar {
    justify-content: flex-start;
}
.layout-menu {
    justify-content: flex-end;
    font-weight: bold;
    position: relative;
    * {
        vertical-align: middle;
    }
    .separator {
        border-left: 1px solid #A7AEB7;
        display: inline-block;
        height: 1em;
        margin: 0 .4em 0 .8em;
        visibility: hidden;
        &.visibi-sep {
            visibility: visible;
        }
    }
    .menu {
        display: inline-block;
        width: 7em;
        list-style: none;
        &:hover {
        .menu-item {
            color: #A7AEB7;
            &:hover {
            color: #fff;
            }
        }
        .menu-list {
            height: auto;
            padding: 2em 0.6em 0.4em 0.4em;
            top: 1em;
        }
        }
        .menu-item {
        display: inline-block;
        position: absolute;
        padding: 0;
        z-index: 100;
        top: 0;
        cursor: pointer;
        }
        .menu-list {
        transition: all 0.2s;
        padding: 0;
        list-style: none;
        z-index: 99;
        position: absolute;
        top: 2.8em;
        height: 0;
        background: #030914;
        left: 0.8em;
        color: #A7AEB7;
        border-radius: 0.5em;
        overflow: hidden;
        li {
            line-height: 2em;
            cursor: pointer;
            &:hover {
            color: #D21C13;
            }
        }
        }
        .ivu-icon {
            width: 16px; 
        }
    }
}
.layout-footer {
    text-align: center;
    background: transparent;
    height: 5em;
    p {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 1em;
    }
    button.plus-btn {
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
        border-radius: 2em;
        width: 4em;
        height: 4em;
        position: fixed;
        bottom: 3em;
        right: 3em;
    }
}
.login-link {
    font-weight: bold;
}
.login-tip {
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 2em;
}
.search-btn {
    display: none;
    font-size: 1em; 
}
@media (max-width: 480px)  {
    .search-btn {
        display: inline-block;
        padding: 5px 0;
    }
    .search-input {
        display: none;
    }
    .search-focus {
        position: absolute;
        background: #FFF;
        left: 0;
        right: 0;
        z-index: 100;
        padding: 0 2em;
        .search-input {
            display: inline-block;
            width: 75%;
        }
        .search-close {
            box-shadow: none;
            display: inline-block;
            font-size: 2em;
            padding: 0;
        }
    }
    .layout-header {
        padding: 0 0 0 2em;
    }
    .layout-menu {
        .menu {
            width: 7em;
            .menu-title {
                display: none;
            }
            &:hover {
                .menu-list {
                    padding-top: 0;
                    top: 3em;
                }
                .menu-item {
                    margin-left: .5em;
                    padding-left: .5px; 
                    &:hover{
                        color: #2b435e;
                    }
                }
                .separator.visibi-sep {
                    visibility: visible;
                    position: absolute;
                    margin: auto;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 0 5px 6px 5px;
                    border-color: transparent transparent #000000 transparent;
                    visibility: visible;
                    bottom: 1em;
                    margin-left: .6em;
                }
            }
            .menu-li {
                text-align: center;
            }
            .separator.visibi-sep {
                visibility: hidden;
            }
        }
    }
    .layout-avatar {
        display: none;
    }
}
</style>
<style lang="less">
#search_book {
    border: 0;
    &:focus {
        outline: 0;
        box-shadow: none;
        &+.ivu-input-prefix {
            color: #D21C13;
        }
    }
}
</style>
<template>
    <Layout class="layout">
        <Header class="layout-header">
        <div class="layout-search" :class="extendSearch">
            <Button type="text"
                slot="prepend"
                icon="ios-search"
                class="search-btn"
                style="box-shadow:none;"
                @click="isSearch=true"
                v-show="!isSearch"
                ></Button>
            <Input
            element-id="search_book"
            prefix="ios-search"
            placeholder="Search Book"
            class="search-input"
            style="border:0;"
            @on-keydown.enter="search"
            v-model="searchWord"
            />
            <Button type="text"
                slot="prepend"
                icon="ios-close"
                class="search-close"
                style="box-shadow:none;"
                @click="isSearch=false"
                v-show="isSearch"
                ></Button>
        </div>
        <div class="layout-logo">
            <router-link to="/"><img src="../assets/logo.svg"></router-link>
        </div>
        <div class="layout-side">
            <div class="layout-avatar">
                <router-link v-if="$root.isLogin"  :to="'/u/' + $root.loginUser.username">
                    <Avatar size="default" :title="$root.name" 
                        :src="$root.fileUrl($root.loginUser.avatar, '/img/user.png')"/>
                </router-link>
            </div>
            <div class="layout-menu">
                <ul class="menu">
                    <li class="menu-li">
                    <span class="separator" :class="{
                        'visibi-sep': $root.isLogin
                    }"></span>
                    <span :class="menuItemClasses">
                        <Icon custom="fa fa-bars"/>
                        <span class="menu-title">Menu</span>
                    </span>
                    </li>
                    <li>
                    <ul :class="menuClasses">
                        <li v-if="$root.isWx">
                            <a href="javascript:void(0)" @click="handleScan">
                                <Icon type="md-qr-scanner"></Icon>
                                <span>Scan</span>
                            </a>
                        </li>
                        <li>
                            <router-link to="/"><Icon type="ios-bookmark"></Icon>
                            <span>Books</span></router-link>
                        </li>
                        <li v-if="!$root.isLogin" @click="loginAccount">
                            <Icon custom="fa fa-sign-in"></Icon>
                            <span>Login</span>
                        </li>
                        <li v-if="$root.isLogin">
                            <Icon type="ios-hand"></Icon>
                            <span>Lends</span>
                        </li>
                        <li v-if="$root.isLogin">
                            <Icon type="md-document"/>
                            <span>Notes</span>
                        </li>
                        <li v-if="$root.isLogin">
                            <Icon type="md-settings"/>
                            <span>Setting</span>
                        </li>
                        <li v-if="$root.isLogin" @click="logoutAccount">
                            <Icon type="md-log-out"/>
                            <span>Logout</span>
                        </li>
                    </ul>
                    </li>
                </ul>
            </div>
        </div>
        </Header>
        <Content>
            <router-view/>
            <p v-if="!$root.isLogin && $route.path.indexOf('/u/') < 0" class="login-tip">You must <a href="javascript:void(0)" @click="loginAccount">login</a> first.</p>
        </Content>
        <Footer class="layout-footer">
            <Button v-if="$root.isLogin" class="plus-btn" type="primary" shape="circle" icon="md-add" @click="$router.push('/book/new')"></Button>
            <p>&copy; 2018 ~ {{new Date().getFullYear()}} Library. All rights reserved.</p>
        </Footer>
        <Login v-model="loginModel" />
        <BackTop style="top: 2em;"></BackTop>
    </Layout>
</template>
<script>
import Login from '../components/login'
export default {
    components: {
        Login
    },
    props: {
        loginPage: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isWxConfig: false,
            isCollapsed: false,
            loginModel: false,
            isSearch: false,
            searchWord: this.$route.params.word || ''
        };
    },
    computed: {
        menuItemClasses() {
            return ["menu-item", this.isCollapsed ? "actived-menu" : ""];
        },
        menuClasses() {
            return ["menu-list", this.isCollapsed ? "actived-menu" : ""];
        },
        extendSearch() {
            return this.isSearch ? 'search-focus' : '';
        }
    },
    mounted() {
        this.$store.dispatch('account/checklogin', (rsp, err) => { 
            if (!this.$root.accessCheck(this.$route)) {
                this.$router.replace('/login');
            }
        });
        this.loginModel = this.loginPage;
    },
    methods: {
        loginAccount() {
            this.$router.replace('/login');
            this.loginModel=true;
        },
        logoutAccount() {
            this.$store.dispatch("account/logout", (rsp, err) => {
                if (!rsp || rsp.state != 0) {
                    err = (err && err.message) || rsp.msg;
                    // this.$Message.error(err);
                    return;
                }
                this.$root.accessCheck(this.$route);
            });
        },
        search () {
            this.$router.replace('/s/' + this.searchWord);
        },
        scanCode () {
            this.$root.wx.scanQRCode({
                needResult: 1, 
                scanType: ["qrCode","barCode"], 
                success: (res) => {
                    var isbn = res.resultStr.split(',').slice(-1).join('');
                    this.$router.push('/book/new/' + isbn);
                },
                error: function(res){
                    this.$Message.error(res.errMsg);
                }
            });
        },
        handleScan () {
            this.$root.registerWx(['scanQRCode'], () => {
                this.scanCode();
            });
        }
    }
};
</script>