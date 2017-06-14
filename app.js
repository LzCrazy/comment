var express = require("express");
var app = express();
var router = require("./router/router.js");
var session = require("express-session");

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.set("view engine","ejs");

// 静态模版
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));

// 路由表
app.get("/",router.showIndex);              //显示首页
app.get("/regist",router.showRegist);       //显示注册页面
app.post("/doregist",router.doRegist);      //执行注册，Ajax服务
app.get("/login",router.showLogin);         //显示登陆页面
app.post("/dologin",router.doLogin);        //执行注册，Ajax服务
app.get("/setavatar",router.showSetavatar); //设置头像页面
app.post("/dosetavatar",router.dosetavatar);//执行设置头像，Ajax服务
app.get("/cut",router.showCut);//显示切图
app.get("/docut",router.doCut);//切图
app.post("/postsad",router.doPost);//发表
app.get("/getAllShuoshuo",router.getAllShuoshuo);//列出所有说说
app.get("/getuserinfo",router.getuserinfo);//列出所有说说信息
app.get("/getshuoshuoamount",router.getshuoshuoamount);//说说总数
app.get("/user/:user",router.showUser);//显示所有用户的说说
app.get("/userlist",router.showuserList);//显示所有用户列表





app.listen(3000);
	