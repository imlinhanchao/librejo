var err = {
    ok: function(action, data) {
        return {
            state: 0, 
            msg: action + "成功！",
            data: data
        };
    },
    existed: { state: 1, msg: "该书籍已添加过！" },
    lended: { state: 2, msg: "该书籍已借出！" },
    param: { state: 3, msg: "参数错误！" }, 
    db: function(err) {
        return { 
            state: 4, 
            msg: "数据库错误：" + err 
        };
    }, 
    query: { state: 5, msg: "无效查询条件！" }, 
    server: function(err){
        return { state: -1, msg: "服务器错误！", err: err }
    }
}

module.exports = err;