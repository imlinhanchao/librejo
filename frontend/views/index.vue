<style scoped lang="less">
.layout{
    border-radius: 4px;
    overflow: hidden;
}
.layout-header {
    height: 100px;
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
    width: 60px;
    height: 60px;
    border-radius: 3px;
    float: left;
    background-size: 100%;
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
                        <MenuItem name="login" v-if="!$root.loginUser">
                            <router-link to="/login">
                            <Icon type="person"></Icon>
                            登录</router-link>
                        </MenuItem>
                        <Submenu name="account" v-if="$root.loginUser">
                            <template slot="title">
                                <Icon type="person"></Icon>
                            {{$root.loginUser.username}}</template>
                            <MenuItem name="logout">
                                <router-link to="/login">
                                <Icon type="log-out"></Icon>
                                退出</router-link>
                            </MenuItem>
                        </Submenu>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '0 50px'}">
                <Layout>
                    <router-view />
                </Layout>
            </Content>
            <Footer class="layout-footer">
                <p>2018 &copy; Hancel</p>
            </Footer>
        </Layout>
    </div>
</template>
<script>
    export default {
        
    }
</script>