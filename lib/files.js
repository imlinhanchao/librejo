const fs = require('fs');
const path = require('path')
const request = require('request').defaults({ jar: true });
const basecfg = require(process.cwd() + '/config').base;
const crypto = require('crypto');

module.exports = {
    download(url, filename, req = request,
        errorfn = function (err) { }, closefn = function () { }) {
        var filepath = path.join(process.cwd(), basecfg.upload, filename);
        this.mkdir(path.dirname(filepath));
        var fws = fs.createWriteStream(filepath);
        let buff = null;
        fws.on('close', closefn);
        fws.on('error', errorfn);
        req.get(url, function (err, res, body) {
            if (err || res.statusCode != 200) {
                try {
                    buff = body;
                    fws.close();
                } catch (error) {
                }
            }
        }).pipe(fws);
        return {
            url: basecfg.fileurl + filename,
            path: filepath,
            buff
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