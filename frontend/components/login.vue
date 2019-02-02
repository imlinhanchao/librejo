<style scoped lang="less">
</style>
<template>
    <Layout>
        <Modal v-model="loginModel" title="Login" width="300">
            <Form ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
                <FormItem prop="username">
                    <Input
                        type="text"
                        v-model="login.username"
                        placeholder="username"
                        @on-keyup.enter="$refs['password'].focus()"
                    >
                        <Icon custom="fa fa-user" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="passwd">
                    <Input ref="password"
                        id="password"
                        :type="passwdType"
                        v-model="login.passwd"
                        placeholder="password"
                        @on-keyup.enter="loginSubmit('loginForm')"
                    >
                        <Icon custom="fa fa-lock" slot="prepend"></Icon>
                        <Button
                            slot="append"
                            :icon="showIcon"
                            @click="isPasswdShow=!isPasswdShow"
                            style="box-shadow:none;"
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
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        const validatePasswd = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("Please enter your password"));
            } else if (value.length < 6) {
                callback(new Error("Your password was too short"));
            } else {
                callback();
            }
        };
        const validateUser = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("Please enter your username"));
            } else if (value.length < 5) {
                callback(new Error("Your username was too short"));
            } else {
                callback();
            }
        };
        return {
            loginModel: false,
            login: {
                username: "",
                passwd: ""
            },
            isPasswdShow: false,
            ruleValidate: {
                username: [{ validator: validateUser, trigger: "blur" }],
                passwd: [{ validator: validatePasswd, trigger: "blur" }]
            },
            login_loading: false
        };
    },
    computed: {
        showIcon() {
            return this.isPasswdShow ? "md-eye-off" : "md-eye";
        },
        passwdType() {
            return this.isPasswdShow ? "text" : "password";
        }
    },
    watch: {
        value(val) {
            if (this.loginModel != val) this.loginModel = val;
        },
        loginModel(val) {
            if (this.loginModel != val) {
                this.$emit("input", val);
            }
        }
    },
    mounted() {
        this.loginModel = this.value;
    },
    methods: {
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
                                this.$emit("input", false);
                                this.$Message.success(`Welcome ${rsp.data.username} !`);
                                this.$router.replace("/");
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