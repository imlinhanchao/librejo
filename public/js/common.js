window.$eles = function (selector) { return document.querySelectorAll(selector) };
window.$ele = function (selector) { return document.querySelector(selector) };
window.api = "/api";
window.query = {
    list: function () {
        var url = location.search;
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    },
    key: function (key) {
        var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    },
    op: function () {
        var search = location.search;
        var theRequest = new Object();
        if (search.indexOf("?") != -1) {
            var paramStr = search.substr(1);
            params = paramStr.split("&");
            for (var i = 0; i < params.length; i++) {
                var ops = ["<=", ">=", "!=", "!$", "=", "<", ">", "^", "&", "|", "$"];
                for (var j = 0; j < ops.length; j++) {
                    op = encodeURIComponent(ops[j]);
                    key_val = params[i].split(op);
                    if (key_val.length >= 2) {
                        theRequest[key_val[0]] = {
                            val: decodeURI(key_val[1]),
                            op: ops[j]
                        };
                        break;
                    }
                }
            }
        }
        return theRequest;
    }
}