const fs = require('fs');
const path = require('path');
const readline = require('readline');

if (!fs.existsSync(path.join(__dirname, '../model/config.json'))) {
    let rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });
    let config = Object.assign({
        host: "",
        user: "",
        password: ""
    }, require('../config').db)
    function input (key, callback) {
        return () => {
            rl.question(`${key}: `,function(val){
                config[key] = val;
                if (callback) callback();
            });
        }
    }
    function callback () {
        fs.writeFile(path.join(__dirname, '../model/config.json'), 
        JSON.stringify({db: config}), (err) => {
            if (err) console.log (`create db config failed: ${err.message}`);
            else main()
        })
        rl.close();
    }
    input('host', input('user', input('password', callback)))()
} else {
    main()
}

function main () {
    (async () => {
        const model = require('../model');
        if (process.argv.length > 2) {
            let table = process.argv[2];
            if (model[table]) {
                await model[table].sync({ force: true });
                console.info(`init model ${table} finish.`);
            }
            else {
                console.info(`model ${table} not found.`);
            }
        } else {
            await model.sync();
            console.info('init all model finish.');
        }
        process.exit();
    })();
}