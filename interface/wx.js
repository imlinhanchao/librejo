const App = require('./app');
const config = require('../config').weixin;
const wechat = require('wechat');
const API = require('wechat-api');
const api = new API(config.appid, config.appsecret);

let __error__ = Object.assign({}, App.error);

class Module extends App {
    constructor(session) {
        super([]);
        this.session = session;
    }

    get error() {
        return __error__;
    }

    sign(data, callback) {
        let keys = ['apiList', 'url'];
        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        var param = {
            debug: false,
            jsApiList: data.apiList,
            url: data.url
        };
        api.getJsConfig(param, (err, result) => callback(err || result));
    }

    static loader(req, res, next) {
        return wechat(config, async (req, res/*, next*/) => {
            // 微信输入信息都在req.weixin上
            let message = req.weixin;
            try {
                console.info(JSON.stringify(message));
                console.info(JSON.stringify(req.wxsession));
    
                let reply = {
                    content: 'coming soon ...',
                    type: 'text'
                };

                res.reply(reply);
            } catch (err) {
                console.error('处理微信回复错误：', err, 'message:', JSON.stringify(message));
                res.reply({
                    type: 'text',
                    content: 'Ops! 服务器开小差了，请稍后重试~ヾ(;ﾟдﾟ)/'
                });
            }
        })(req, res, next);
    }
}
module.exports = Module;
