
class AppError extends Error {
    constructor(state, message, data) {
        super(message);
        this.state = state;
        this.msg = message;
        this.data = data;
        this.stack = undefined;
        this.isdefine = true;
    };

    toString() {
        return {
            state: this.state,
            msg: this.message,
            data: this.data || "",
        };
    }
    toJSON() {
        return {
            state: this.state,
            msg: this.message,
            data: this.data || "",
        };
    }
}

class App {
    constructor() {

    };

    static filter(data, keys) {
        let d = {};
        if (!data) return d;
        for (let i = 0; i < keys.length; i++) {
            if (undefined == data[keys[i]]) continue;
            d[keys[i]] = data[keys[i]];
            if (d[keys[i]].replace)
                d[keys[i]] = d[keys[i]].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
        return d;
    };

    static haskeys(data, keys) {
        if (!data) return false;
        for (let i = 0; i < keys.length; i++) {
            if (undefined == data[keys[i]]) 
                return false;
        }
        return true;
    };

    static onlykeys(data, keys) {
        if (!data) return false;
        for (let key in data) {
            if (keys.indexOf(key) < 0) return false;
        }
        return true;
    };

    static res(data, msg = "") {
        return {
            state: 0,
            msg: msg,
            data: data
        }
    };

    static where(query) {
        let where = {};
        for (let k in query) {
            if ("" === query[k])
                continue;
            where[k] = App.op(query[k])
        }
        return where;
    }

    static order(order) {
        let orders = [];
        for (let k in order) {
            if ("" === order[k])
                continue;
            orders.push([k, order[k]]);
        }
        return orders;
    }

    static op(data) {
        const ops = {
            "<=": "$lte",
            ">=": "$gte",
            "!=": "$ne",
            "!$": "$notLike",
            "=": "$eq",
            "<": "$lt",
            ">": "$gt",
            "^": "$bitXor",
            "&": "$bitAnd",
            "|": "$bitOr",
            "$": "$like"
        };

        let operator = "$eq";
        if (data.op && ops[data.op]) {
            operator = ops[data.op];
            data = data.val;
        }

        return JSON.parse('{"' + operator + '": ' + JSON.stringify(data) + '}');
    }

    static ok(action, data = undefined, customizeTip = false) {
        return {
            state: 0,
            msg: action + (customizeTip ? "" : "成功！"),
            data: data
        }
    }

    static err(err) {
        if (err.isdefine) {
            return err;
        } else {
            return App.error.server(err.message, err.stack)
        }
    }

    static get error() {
        return {
            __count: 7,
            init: function (errorCode) {
                this.__count = errorCode;
            },
            reg: function (msg, fn = null) {
                let errorCode = this.__count++;
                if (fn) {
                    return function (data) {
                        return new AppError(
                            errorCode,
                            msg,
                            fn(data)
                        )
                    }
                } else {
                    return new AppError(
                        errorCode,
                        msg
                    )
                }
            },
            existed: function (obj, exist = true, customizeTip = false) {
                return new AppError(
                    1,
                    obj + (customizeTip ? "" : (exist ? "已存在！" : "不存在！"))
                )
            },
            param: new AppError(2, "参数错误！"),
            query: new AppError(3, "无效查询条件！"),
            db: function (err) {
                return new AppError(
                    4,
                    "数据库错误：" + err
                );
            },
            network: function (err) {
                return new AppError(
                    5,
                    "网络错误：" + err
                );
            },
            limited: new AppError(
                6,
                "权限不足"
            ),

            server: function (err, stack) {
                if (err) console.log(err);
                if (stack) console.log(stack);
                return new AppError(
                    -1,
                    "服务器错误！" + (err ? err : "")
                )
            },
        }
    };
}


module.exports = App;