const model = require('../model');

(async () => {
    if (process.argv.length > 2) {
        let table = process.argv[2];
        if (model[table]) {
            await model[table].sync({ force: true });
            console.log(`init model ${table} finish.`)
        }
        else {
            console.log(`model ${table} not found.`);
        }
    } else {
        await model.sync();
        console.log('init all model finish.');
    }
    process.exit();
})();
