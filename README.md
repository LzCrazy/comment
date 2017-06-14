### comment

*一个博客项目*
#### 对应文件及文件夹的用处：
- models: 存放操作数据库的文件
- public: 存放静态文件，如样式、图片等
- routes: 存放路由文件
- views: 存放模板文件
- app.js: 程序主文件
- package.json: 存储项目名、描述、作者、依赖等等信息
#### 对应模块的用处：
- express: web 框架
- express-session: session 中间件
- mongodb: 将 session 存储于 mongodb，结合 express-session 使用
- ejs:引擎模版
- formidable:表单提交及文件上传的中间件
- gm:切图框架
#### 功能及路由设计

-    注册
       - 注册页：GET /regist
       - 注册（包含上传头像）：POST /regist
-    登录
       - 登录页：GET /login
       - 登录：POST /login
       - 登出：GET /login
-    查看文章
       - 主页：GET /posts
       - 个人主页：GET /posts?author=xxx
       - 查看一篇文章（包含留言）：GET /posts/:postId
-    发表文章
       - 发表文章页：GET /posts/create
       - 发表文章：POST /posts
> 启动

    npm install
    mongod --dbpath ../comment
