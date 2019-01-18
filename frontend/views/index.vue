<style scoped lang="less">
.layout {
  border-radius: 4px;
  background: transparent;
}
.layout-header {
  display: flex;
  background: transparent;
  position: relative;
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
    border-left: 1px solid #707070;
    display: inline-block;
    height: 30%;
    margin: 0 0.5em;
  }
  .menu {
    display: inline-block;
    width: 5em;
    list-style: none;
    &:hover {
      .menu-item {
        color: #707070;
        &:hover {
          color: #fff;
        }
      }
      .menu-list {
        height: auto;
        padding: 2em 0.4em 0.4em;
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
      top: 1em;
      height: 0;
      background: #232425;
      left: 0.8em;
      color: #707070;
      border-radius: 0.5em;
      overflow: hidden;
      li {
        line-height: 2em;
        cursor: pointer;
        &:hover {
          color: #fff;
        }
      }
    }
  }
}
</style>
<style lang="less">
#search_book {
  border: 0;
  &:focus {
    outline: 0;
    box-shadow: none;
  }
}
</style>
<template>
  <Layout class="layout">
    <Header class="layout-header">
      <div class="layout-search">
        <Input
          element-id="search_book"
          prefix="ios-search"
          placeholder="Search Book"
          class="search-input"
          style="border:0;"
        />
      </div>
      <div class="layout-logo">
        <img src="../assets/logo.svg">
      </div>
      <div class="layout-side">
        <div class="layout-avatar">
          <Avatar icon="ios-person" size="default"/>
        </div>
        <div class="layout-menu">
          <span class="separator"></span>
          <ul class="menu">
            <li>
              <span :class="menuItemClasses">
                <Icon custom="fa fa-bars"/>
                <span>Menu</span>
              </span>
            </li>
            <li>
              <ul :class="menuClasses">
                <li>
                  <Icon type="ios-bookmark"></Icon>
                  <span>Books</span>
                </li>
                <li>
                  <Icon type="ios-hand"></Icon>
                  <span>Lends</span>
                </li>
                <li>
                  <Icon type="md-document"/>
                  <span>Notes</span>
                </li>
                <li>
                  <Icon type="md-settings"/>
                  <span>Setting</span>
                </li>
                <li>
                  <Icon type="md-log-out"/>
                  <span>Logout</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </Header>
    <Content :style="{padding: '10px 50px'}">
      <Layout>
        <router-view/>
      </Layout>
    </Content>
    <Footer class="layout-footer">
      <p>2018 &copy; Hancel</p>
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
            <Icon type="ios-person-outline" slot="prepend"></Icon>
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
            <Icon type="ios-locked-outline" slot="prepend"></Icon>
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
      menuActive: "1-1"
    };
  },
  computed: {
    loginUser() {
      return this.$store.getters.userInfo;
    },
    menuItemClasses() {
      return ["menu-item", this.isCollapsed ? "actived-menu" : ""];
    },
    menuClasses() {
      return ["menu-list", this.isCollapsed ? "actived-menu" : ""];
    },
    name() {
      return this.loginUser ? this.loginUser.name : "";
    },
    isLogin() {
      return this.$store.getters.isLogin;
    },
    collapsed() {
      return [this.isCollapsed ? "collapsed" : ""];
    },
    showIcon() {
      return this.isPasswdShow ? "eye-disabled" : "eye";
    },
    passwdType() {
      return this.isPasswdShow ? "text" : "password";
    },
    compiledMarkdown: function() {
      return this.$marked(this.notes, { sanitize: true });
    }
  },
  mounted() {},
  methods: {
    logoutAccount() {
      this.$store.dispatch("logout", (rsp, err) => {
        if (!rsp || rsp.state != 0) {
          err = (err && err.message) || rsp.msg;
          // this.$Message.error(err);
        }
        this.menuActive = "1-1";
      });
    },
    loginSubmit() {
      this.$refs["loginForm"].validate(valid => {
        if (valid) {
          this.login_loading = true;
          this.$store.dispatch("login", {
            user: this.login,
            callback: (rsp, err) => {
              this.login_loading = false;
              if (rsp && rsp.state == 0) {
                this.loginModel = false;
                this.menuActive = "1-1";
              } else {
                err = (err && err.message) || rsp.msg;
                this.$Message.error(err);
              }
            }
          });
        }
      });
    }
  }
};
</script>