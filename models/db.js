// 封装对数据库的常用操作
var MongoClient = require("mongodb").MongoClient;
// var assert = require("assert");
var setting = require("../models/setting.js");

// 将数据库的连接封装成函数
function _connectDB(callback){
	var url =setting.dburl;
	MongoClient.connect(url,function(err,db){
		if(err){
			callback(err,null);
			return;
		}
		console.log("连接成功");
		callback(err,db);
	});
}
// 初始化
init();

function init(){
	// 对数据库进行初始化
	_connectDB(function(err,db){
		if(err){
			console.log(err);
			return;
		}
		db.collection("users").createIndex(
			{"username":1},//正向排序
			null,
			function(err,results){
				if(err){
					console.log(err);
					return;
				}
				console.log("索引建立成功");
			})
	})
}

// 插入数据
exports.insertOne = function(collectionName,json,callback){
	_connectDB(function(err,db){
		db.collection(collectionName).insertOne(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}

// 查找  args(是个对象)分页参数
// exports.find = function(collectionName,json,args,callback){

exports.find = function(collectionName,json,C,D){
	// 结果数组
	var result = [];
	if(arguments.length == 3){
		// 那么参数C就是callback，参数D没有传
		var callback = C ;
		// 数目限制
		var skipNumber = 0;
		//数目限制
		var limit = 0;

		// callback("find函数接收4个参数",null);
		// return;
	}else if(arguments.length==4){
		var callback = D;
		var args = C;
		// 跨越条数
		var skipNumber = args.pageamount*args.page || 0;
		// 数目限制
		var limit = args.pageamount || 0;
		// 排序方式
		var sort = args.sort || {};
	}else{
		throw new Error("find函数接收参数,要么是3个，要么是4个");
		return;
	}
	

	// console.log(skipNumber,limit);

	_connectDB(function(err,db){
		var cursor = db.collection(collectionName).find(json).skip(skipNumber).limit(limit).sort(sort);
		cursor.each(function(err,doc){
			if(err){
				callback(err,null);
				db.close();
				return;
			}
			// assert.equal(err,null);
			if(doc != null){
				// 放入结果数组
				result.push(doc);
			}else{
				// 遍历结束，需要回调,没有更多的文档
				callback(null,result);
				db.close();
			}
		})
	})
}
// 删除
exports.deleteMany = function(collectionName,json,callback){
	_connectDB(function(err,db){
		//删除
		db.collection(collectionName).deleteMany(
			json,function(err,result){
				console.log(result);
				callback(err,result);
				db.close();
			})
	})
}
// 修改
exports.updateMany = function(collectionName,json1,json2,callback){
	_connectDB(function(err,db){
		db.collection(collectionName).updateMany(
			json1,
			json2,
			function(err,result){
				callback(err,result);
				db.close();
			})
	})
}
// 获取所有数据
exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
}










