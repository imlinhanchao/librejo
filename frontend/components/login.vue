<style scoped lang="less">
.layout-form {
    i {
        width: 15px;
    }
}
</style>
<template>
    <Layout>
        <Modal v-model="loginModel" title="Login" width="300" :mask-closable="false" @on-visible-change="change">
            <Form ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
                <FormItem prop="username">
                    <Input
                        type="text"
                        v-model="login.username"
                        placeholder="username"
                        @on-keyup.enter="$refs['password'].focus()"
                        @on-blur="existCheck"
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
                        @on-keyup.enter="isRegister ? $refs['email'].focus() : loginSubmit('loginForm')"
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
                <FormItem v-if="isRegister" prop="email">
                    <Input ref="email" 
                        type="text"
                        v-model="login.email"
                        placeholder="email"
                        @on-keyup.enter="$refs['captcha'].focus()"
                    >
                        <Icon custom="fa fa-envelope" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem v-if="isRegister" prop="captcha">
                    <Input ref="captcha"
                        type="text"
                        v-model="login.captcha"
                        placeholder="Are you a robot ?"
                        @on-keyup.enter="submit('loginForm')"
                    >
                        <Icon
                            slot="prepend"
                            custom="fa fa-refresh"
                            @click="rand=Math.random()"
                        />
                        <img slot="append" :src="`/api/lib/captcha?r=${rand}`" style="height: 28px; margin: -4px -7px;"/>
                    </Input>
                </FormItem>
            </Form>
            <div slot="footer" class="login-footer">
                <Button type="primary" @click="submit('loginForm')" :loading="login_loading">{{btnName}}</Button>
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
        const validateEmail = (rule, value, callback) => {
            if (!this.isRegister) return;
            if (value === "") {
                callback(new Error("Please enter your email"));
            } else {
                this.$store.dispatch('account/exist', {
                    other: {
                        email: this.login.email
                    },
                    callback: (rsp, err) => {
                        if (rsp && rsp.state == 0) {
                            if (rsp.data) {
                                callback(new Error('The email was register.'));
                            } else {
                                callback();
                            }
                        } else {
                            err = (err && err.message) || rsp.msg;
                            this.$Message.error(err);
                        }  
                    }
                })
                callback();
            }
        };
        return {
            loginModel: false,
            login: {
                username: '',
                passwd: '',
                email: '',
                captcha: ''
            },
            isPasswdShow: false,
            ruleValidate: {
                username: [{ validator: validateUser, trigger: "blur" }],
                passwd: [{ validator: validatePasswd, trigger: "blur" }],
                email: [{ validator: validateEmail, trigger: "blur" }],
                captcha: [{ }]
            },
            login_loading: false,
            isRegister: false,
            rand: Math.random()
        };
    },
    computed: {
        showIcon() {
            return this.isPasswdShow ? "md-eye-off" : "md-eye";
        },
        passwdType() {
            return this.isPasswdShow ? "text" : "password";
        },
        submit () {
            return this.isRegister ? this.registerSubmit : this.loginSubmit
        },
        btnName() {
            return this.isRegister ? 'Register' : 'Login'
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
        change (val) {
            this.$emit("input", val);
        },
        loginSubmit(form) {
            this.$refs[form].validate(valid => {
                if (valid) {
                    this.login_loading = true;
                    this.$store.dispatch('account/login', {
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
        },
        registerSubmit(form) {
            this.$refs[form].validate(valid => {
                if (valid) {
                    this.login_loading = true;
                    this.$store.dispatch('account/create', {
                        user: this.login,
                        callback: (rsp, err) => {
                            if (rsp && rsp.state == 0) {
                                this.loginSubmit(form)
                            } else {
                                this.login_loading = false;
                                err = (err && err.message) || rsp.msg;
                                this.$Message.error(err);
                            }
                        }
                    });
                }
            });
        },
        existCheck (usename) {
            if (this.login.username == '') return true;
            this.$store.dispatch("account/exist", {
                username: this.login.username,
                callback: (rsp, err) => {
                    console.log(rsp);
                    this.isRegister = !rsp.data
                }
            })
        }
    }
};
</script>