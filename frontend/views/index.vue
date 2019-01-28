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
    margin: 0 0.8em;
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
        .ivu-icon {
            width: 16px; 
        }
      }
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
    box-shadow: 0px 0px 10px #00000066;
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
          <Avatar icon="ios-person" size="default" v-if="isLogin"/>
        </div>
        <div class="layout-menu">
          <ul class="menu">
            <li class="menu-li">
              <span class="separator" :class="{
                  'visibi-sep': isLogin
              }"></span>
              <span :class="menuItemClasses">
                <Icon custom="fa fa-bars"/>
                <span class="menu-title">Menu</span>
              </span>
            </li>
            <li>
              <ul :class="menuClasses">
                <li>
                  <router-link to="/"><Icon type="ios-bookmark"></Icon>
                  <span>Books</span></router-link>
                </li>
                <li v-if="!isLogin" @click="loginAccount">
                  <Icon custom="fa fa-sign-in"></Icon>
                  <span>Login</span>
                </li>
                <li v-if="isLogin">
                  <Icon type="ios-hand"></Icon>
                  <span>Lends</span>
                </li>
                <li v-if="isLogin">
                  <Icon type="md-document"/>
                  <span>Notes</span>
                </li>
                <li v-if="isLogin">
                  <Icon type="md-settings"/>
                  <span>Setting</span>
                </li>
                <li v-if="isLogin" @click="logoutAccount">
                  <Icon type="md-log-out"/>
                  <span>Logout</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </Header>
    <Content :style="{padding: '10px 2em'}">
      <Layout>
        <router-view/>
        <p v-if="!isLogin" class="login-tip">You must <a href="javascript:void(0)" @click="loginAccount">login</a> first.</p>
      </Layout>
    </Content>
    <Footer class="layout-footer">
      <Button v-if="isLogin" class="plus-btn" type="primary" shape="circle" icon="md-add" @click="$router.push('/book/new')"></Button>
      <p>&copy; 2018 ~ {{new Date().getFullYear()}} Library. All rights reserved.</p>
    </Footer>
    <Modal v-model="loginModel" title="登录" width="300">
      <Form ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
        <FormItem prop="username">
          <Input
            type="text"
            v-model="login.username"
            placeholder="用户名"
            @keyup.13="document.getElementById('password').focus()"
          >
            <Icon custom="fa fa-user" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="passwd">
          <Input
            id="password"
            :type="passwdType"
            v-model="login.passwd"
            placeholder="密码"
            @keyup.13="loginSubmit('loginForm')"
          >
            <Icon custom="fa fa-lock" slot="prepend"></Icon>
            <Button
              slot="append"
              :icon="showIcon"
              @click="isPasswdShow=!isPasswdShow"
              style="box-shadow:none;"
              :loading="login_loading"
            ></Button>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer" class="login-footer">
        <Button type="primary" @click="loginSubmit('loginForm')" :loading="login_loading">登录</Button>
      </div>
    </Modal>
  </Layout>
</template>
<script>

export default {
  props: {
    loginPage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: false,
      loginModel: false,
      login: {
        username: "",
        passwd: ""
      },
      isPasswdShow: false,
      ruleValidate: {
        username: [
          { required: true, message: "请输入用户名。", trigger: "blur" }
        ],
        passwd: [{ required: true, message: "请输入密码。", trigger: "blur" }]
      },
      login_loading: false,
      isSearch: false,
      searchWord: this.$route.params.word || ''
    };
  },
  computed: {
    loginUser() {
      return this.$store.getters['account/info'];
    },
    menuItemClasses() {
      return ["menu-item", this.isCollapsed ? "actived-menu" : ""];
    },
    menuClasses() {
      return ["menu-list", this.isCollapsed ? "actived-menu" : ""];
    },
    name() {
      return this.loginUser ? this.loginUser.nickname : "";
    },
    isLogin() {
      return this.$store.getters['account/isLogin'];
    },
    showIcon() {
      return this.isPasswdShow ? "md-eye-off" : "md-eye";
    },
    passwdType() {
      return this.isPasswdShow ? "text" : "password";
    },
    extendSearch() {
        return this.isSearch ? 'search-focus' : '';
    }
  },
  mounted() {
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
        this.loginAccount();
      });
    },
    loginSubmit(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.login_loading = true;
          this.$store.dispatch("account/login", {
            user: this.login,
            callback: (rsp, err) => {
              this.login_loading = false;
              if (rsp && rsp.state == 0) {
                this.loginModel = false;
                this.$Message.success(`Welcome ${this.name} !`);
                this.$router.replace('/');
              } else {
                err = (err && err.message) || rsp.msg;
                this.$Message.error(err);
              }
            }
          });
        }
      });
    },
    search () {
        this.$router.replace('/s/' + this.searchWord);
    }
  }
};
</script>