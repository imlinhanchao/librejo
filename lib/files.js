const fs = require('fs');
const path = require('path');
const request = require('request-promise').defaults({ jar: true });
const filecfg = require(process.cwd() + '/config').file;
const crypto = require('crypto');

module.exports = {
    async download(url, filename, req = request) {
        var filepath = path.join(process.cwd(), filecfg.upload, filename);
        this.mkdir(path.dirname(filepath));
        let buff = await req({ url, encoding: null });
        fs.writeFileSync(filepath, buff);
        return {
            url: filename,
            path: filepath,
            hash: this.hash(buff)
        };
    },

    exists(directory) {
        return fs.existsSync(directory);
    },

    mkdir(directory) {
        if (this.exists(directory)) return;
        fs.mkdirSync(directory);
    },

    del(file) {
        fs.unlink(file);
    },

    rename(oldpath, newpath) {
        try {
            fs.renameSync(oldpath, newpath);
        } catch (error) {
            console.error(error);
        }
    },

    hash(buff) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(buff).digest('hex');
        return hash;
    }
};