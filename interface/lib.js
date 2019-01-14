const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const util = require('util');
const App = require('./app');
const files = require('../lib/files');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const filecfg = require('../config').file;

let __error__ = Object.assign({}, App.error);
__error__.toobig = App.error.reg('上传文件过大！');

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'okupload', msg: '上传成功' },
        ]);
        this.session = session;
    }

    get error() {
        return __error__;
    }
    
    async upload(req) {
        try {
            let dirpath = path.join(process.cwd(), filecfg.upload)
            files.mkdir(dirpath);
            let filenames = []
            for (let i = 0; i < req.files.length; i++) {
                if (req.files[i].size > filecfg.maxSize * 1024 * 1024) {
                    throw(this.error.toobig);
                }
                let data = req.files[i].buffer;
                let sha256 = crypto.createHash('sha256');
                let hash = sha256.update(data).digest('hex');
                let filename = hash + path.extname(req.files[i].originalname);
                let savepath = path.join(dirpath, filename);
                if (!files.exists(savepath))
                    await writeFile(savepath, data);
                filenames.push(filename)
            }
            return this.okupload(filenames);
        } catch (error) {
            console.dir(error)
        }
    }
}

module.exports = Module;