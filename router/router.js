var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var gm = require("gm");

//首页
exports.showIndex = function (req, res, next) {
    //检索数据库，查找此人的头像
    if (req.session.login == "1") {
        //如果登陆了
        var username = req.session.username;
        var login = true;
    } else {
        //没有登陆
        var username = "";  //制定一个空用户名
        var login = false;
    }
    //已经登陆了，那么就要检索数据库，查登陆这个人的头像
    db.find("users", {username: username}, function (err, result) {
        if (result.length == 0) {
            var avatar = "moren.jpg";
        } else {
            var avatar = result[0].avatar;
        }
        res.render("index", {
            "login": login,
            "username": username,
            "active": "首页",
            "avatar": avatar    //登录人的头像
        });
    });
};
// 注册
exports.showRegist = function(req,res,next){
	res.render("regist",{
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "注册"
    });
}

//注册业务
exports.doRegist = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var username = fields.username;
        var password = fields.password;

        //console.log(username,password);
        //查询数据库中是不是有这个人
        db.find("users", {"username": username}, function (err, result) {
            if (err) {
                res.send("-3"); //服务器错误
                return;
            }
            if (result.length != 0) {
                res.send("-1"); //被占用
                return;
            }
            //没有相同的人，就可以执行接下来的代码了：
            //设置md5加密
            password = md5(md5(password) + "LzCrazy");

            //现在可以证明，用户名没有被占用
            db.insertOne("users", {
                "username": username,
                "password": password,
                "avatar": "moren.jpg"
            }, function (err, result) {
                if (err) {
                    res.send("-3"); //服务器错误
                    return;
                }
                req.session.login = "1";
                req.session.username = username;
// 
                res.send("1"); //注册成功，写入session
            })
        });
    });
};
// 登陆
exports.showLogin = function(req,res,next){
	res.render("login", {
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "登陆"
    });
}
// 登陆业务
exports.doLogin = function(req,res,next){
	// 得到表单
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		// 得到表单之后
		var username = fields.username;
		var password = fields.password;
		console.log(username,password);
		var jiami = md5(md5(password)+"LzCrazy");
		// 查询数据库，是否有这个用户
		db.find("users",{"username":username},function(err,result){
			if(err){
				res.send("-5");
				return;
			}
			// 咩有这个人
			if(result.length == 0){
				res.send("-1");//用户不存在
				return;
			}
			// 有这个人则验证密码
			if(jiami == result[0].password){
				req.session.login="1";
				req.session.username=username;
				res.send("1");//登陆成功
				return;
			}else{
				res.send("-2");//密码错误
				return;
			}
		});

	});
};
// 设置头像页面,保证此时是登陆状态
exports.showSetavatar = function(req,res,next){
    // if(req.session.login != "1"){
    //     res.end("还没有登陆，请登陆后设置");
    //     return;
    res.render("setavatar", {
        "login": true,
        "username": req.session.username || "123123",
        "active": "修改头像"
    });
}
// 
exports.dosetavatar = function(req,res,next){
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname+"/../avatar");
    form.parse(req,function(err,fields,files){
        console.log(files);
        // var oldername = files.touxiang.path;
        var oldername = files.touxiang.path;
        var newname = path.normalize(__dirname + "/../avatar") + "/" + req.session.username + ".jpg";
        fs.rename(oldername,newname,function(err){
            if(err){
                res.send("失败");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            // res.send("avatar success");
            // 跳转到切图页面
            res.redirect("/cut");
        });
    })
}
// 切图
exports.showCut = function(req,res){
    res.render("cut",{
        avatar:req.session.avatar
    });
}
// 执行切图

exports.doCut = function(req,res,next){
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm("./avatar/"+filename)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write("./avatar/"+filename,function(err){
            if(err){
                res.send("-1");
                console.log(err);
                return;
            }
            // 更改数据库当前用户的avatar这个值
            db.updateMany("users",{"username":req.session.username},{
                $set:{"avatar":req.session.avatar}
            },function(err,result){
                res.send("1");
            })
        })
}
// 发表说说

exports.doPost = function(req,res,next){
    // 保证已经登陆
    if(req.session.login != "1"){
        res.end("非法进入，需要登陆")
        return;
    }
    // username
    var username = req.session.username;
    // 得到用户填写信息
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fileds,files){
        // 得到表单之后
        var content = fileds.content;
        // console.log(content,password);
        // 查询数据库中是否有这个人
        db.insertOne("posts",{
            "username":username,
            "datatime":new Date(),
            "content":content
        },function(err,result){
            if(err){
                res.send("-3");
                return;
            }
            res.send("1");
        })
    })
}

// 列出所有说说，有分页功能
exports.getAllShuoshuo = function(req,res,next){
    // 这个页面接收一个参数，页面
    var page = req.query.page;
    db.find("posts",{},{"pageamount":10,"page":page,"sort":{"datatime":-1}},function(err,result){
        res.json(result);
    })
};
// 列出用户信息
exports.getuserinfo = function(req,res,next){
    var username = req.query.username;
    db.find("users",{"username":username},function(err,result){
        if(err || result.length == 0){
            res.json("");
            return;
        }
        var obj ={
            "username":result[0].username,
            "avatar":result[0].avatar,
            "_id":result[0]._id,
        }
        res.json(obj);
    })
}

// 说说总数
exports.getshuoshuoamount = function(req,res,next){
    db.getAllCount("posts",function(count){
        res.send(count.toString());
    });
}

// 显示用户的个人主页
exports.showUser = function(req,res,next){
    var user = req.params["user"];
    db.find("posts",{"username":user},function(err,result){
       db.find("users",{"username":user},function(err,result2){
           res.render("user",{
               "login": req.session.login == "1" ? true : false,
               "username": req.session.login == "1" ? req.session.username : "",
               "user" : user,
               "active" : "我的说说",
               "sirenshuoshuo" : result,
               "sirentouxiang" : result2[0].avatar
           });
       });
    });

}

// 显示所有注册用户
exports.showuserList = function(req,res,next){
    db.find("users",{},function(err,result){
        res.render("userlist",{
            "login":req.session.login == "1"?true:false,
            "username":req.session.login == "1"?req.session.username:"",
            "active":"成员列表",
            "allPerson":result
        });
    })
}












