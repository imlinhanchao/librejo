# 个人图书馆管理网站

## 功能

- [x] 管理图书
- [ ] 个人主页
- [ ] 借阅管理
- [ ] 阅读进度管理
- [ ] 笔记管理
- [ ] 导入豆瓣已读
- [ ] 导入豆瓣笔记
- [ ] ~~绑定豆瓣（豆瓣已关闭开放平台）~~
- [x] 移动端适配
- [x] 部署脚本
- [ ] ifttt支援

## 目录说明
1. bin - 服务启动入口  
2. interface - 业务接口实现   
3. frontend - 前端代码  
    1. assets - 前端资源  
    2. components - 前端组件
    3. config - 运行与编译变量配置
    4. libs - 前端工具
    5. store - vue store
    6. template - 界面模板
    7. theme - 全局演示
    8. views - 界面 vue 文件
4. lib - 公共类库  
5. pubilc - 静态资源  
6. routes - 服务路由  
7. view - 视图  
8. script - 脚本 

## 数据库部署说明
1. 新建数据库`db`（以`config.json`内配置的数据库为准）；
3. 执行`npm run initdb`，并根据提示填写数据库连接信息（仅第一次）；
4. 若需要重置某个表，如：重置`account`表，则执行`npm run initdb -- account`。

# 调试说明
1. 执行`npm install`;
2. 前端执行`npm run dev`，后端使用 Visual Studio Code 运行调试（直接按下`F5`即可）。

## 部署说明
服务器需安装`nodejs`和`npm`。部署执行如下脚本：
```bash
npm install
```

编译前端代码：  
```bash
npm run build
```

启动服务：
```bash
npm start
```

以守护进程方式，启动服务：
```bash
forever start ./bin/www
```

## 端口号
- 6789 （可在`config.json`配置）
