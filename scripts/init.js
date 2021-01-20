const fs = require('fs');
const path = require('path');
const readline = require('readline');
const config = require('../config');
const uuidv4 = require('uuid/v4');

const randomStr = () => randomUp(Math.random().toString(36).substr(2));
const randomUp = s => s.split('').map(s => parseInt(Math.random() * 10) % 2 ? s : s.toUpperCase()).join('');

async function main() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.inputData = function (key, defaultVal) {
        return new Promise((resolve, reject) => {
            try {
                this.question(`${key}: ` + (defaultVal ? `[${defaultVal}]` : ''), function (val) {
                    resolve(val || defaultVal);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    console.info('Let\'s config website.');

    if (config.base['identityKey'] == ''
        || await rl.inputData('Do you want to reset safe key config (identityKey etc.) ?', 'N') == 'Y') {
        config.base['identityKey'] = '_LIB_SESSION_ID_' + randomStr();
        config.base['secret'] = randomStr() + randomStr();
        config.base['salt'] = randomUp(uuidv4());
    }
    config.base['port'] = parseInt(await rl.inputData('Port', config.base['port']));
    config.base['domain'] = await rl.inputData('Domain', config.base['domain']);
    config.base['api_key'] = await rl.inputData('Douban API Key', config.base['api_key']);

    config.base['name'] = await rl.inputData('Website Name', config.base['name']);
    
    config.file['maxSize'] = await rl.inputData('Max Size File Upload(MB)', config.file['maxSize']);
    
    config.db['port'] = parseInt(await rl.inputData('Database Port', config.db['port']));
    config.db['database'] = await rl.inputData('Database Name', config.db['database']);
    config.db['prefix'] = await rl.inputData('Table Prefix', config.db['prefix']);
    config.db['logging'] = await rl.inputData('Log SQL Execute', config.db['logging'] ? 'Y' : 'N') == 'Y';

    let dbConfig = Object.assign({}, config.db);
    dbConfig['host'] = await rl.inputData('Database Host', 'localhost');
    dbConfig['user'] = await rl.inputData('Database User', 'root');
    dbConfig['password'] = await rl.inputData('Database Password', '');
    
    if (await rl.inputData('Do you config WeiXin? ', 'Y') == 'Y') {
        config.weixin['appid'] = await rl.inputData('App Id', config.weixin['appid']);
        config.weixin['appsecret'] = await rl.inputData('App Secret', config.weixin['appsecret']);
        config.weixin['encodingAESKey'] = await rl.inputData('Encoding AESKey', config.weixin['encodingAESKey']);        
        config.weixin['token'] = await rl.inputData('Token', config.weixin['token']);        
    }

    fs.writeFile(path.join(__dirname, '../config.json'),
        JSON.stringify(config, null, 4),
        (err) => {
            if (err) console.error(`Save website config failed: ${err.message}`);
            else {
                // Save DB Config
                fs.writeFile(path.join(__dirname, '../model/config.json'),
                JSON.stringify(dbConfig, null, 4),
                (err) => {
                    if (err) console.error(`Save db config failed: ${err.message}`);
                    else initDB();
                });        
            }
        });
    rl.close();

}

function initDB () {
    (async () => {
        const model = require('../model');
        try {
            await model.sync();
            console.info('Init all model finish.');
        } catch (err) {
            console.error(`Init model failed: ${err.message}`);                
        }
        console.info('Please execute \'npm run build\' to build frontend, and then execute \'npm  start\' to start the website.');
        process.exit();
    })();
}

main();