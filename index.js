// 1.引入两个模块 mysql  express
const express=require("express");
const mysql=require("mysql");
//1.1 引入模块 cors 跨域
const cors=require("cors");

//2.创建连接池
var pool=mysql.createPool({
  host     : process.env.MYSQL_HOST,
  port     : process.env.MYSQL_PORT,
  user     : process.env.ACCESSKEY,
  password : process.env.SECRETKEY,
  database : 'app_' + process.env.APPNAME,
  connectionLimit:5
})
//3.创建express对象
var server=express();
//3.1 配置允许访问列
server.use(cors({
    origin:["http://127.0.0.1:8080","http://localhost:8080"],
    credentials:true
}));
//3.11 加载模块 express-session
const session = require("express-session");
//3.12 配置模块
server.use(session({
  secret:"128位随机字符串",
  resave:false,
  saveUninitialized:true,
  cookie:{
    maxAge:1000*60*60
  }
}));
//3.2配置静态资源目录 public
server.use(express.static("public"));
//3.3引入第三方中间件
const bodyParser = require("body-parser");
//3.4配置第三方中间件
server.use(bodyParser.urlencoded(
    {extended:false}
))
//4.为express对象绑定监听端口 3000
server.listen(5050);
//功能三:首页轮播图
server.get("/imglist",(req,res)=>{
    var rows = [
      {id:1,img_url:"img/index/1552879033.png"},
      {id:2,img_url:"img/index/1552878344.png"},
      
    ];
    res.send({code:1,data:rows});
  });
//功能四:首页九宫格
server.get("/grid",(req,res)=>{
    var rows = [
      {id:1,title:"加盟流程",img_url:"img/grid/1515811688.png"},
      {id:2,title:"加盟优势",img_url:"img/grid/1515811256.png"},
      {id:3,title:"加盟政策",img_url:"img/grid/1515811003.png"},
      {id:4,title:"加入我们",img_url:"img/grid/1515983032.png"},
                
    ];
    res.send(rows);
  });
// 商品列表
//用户get 请求路径 /getProducts
server.get("/getProducts",(req,res)=>{
  //1.获取用户参数 pno pageSize
  var pno=req.query.pno;
  var pageSize=req.query.pageSize;
  //res.send(pno+":"+pageSize);//验证是否能获取数据
  //2.为参数设置默认值 pno:1 pageSize:4
  if(!pno){pno=1}
  if(!pageSize){pageSize=16}
  //res.send(pno+":"+pageSize);//验证是否能实现默认值1 4
  //3.创建SQL语句
  sql="select * from tea_shop LIMIT ?,?";
  //3.1 计算开始记录数，几条记录
  var offset=(pno-1)*pageSize;
  pageSize=parseInt(pageSize);
  //4.执行SQL语句
  pool.query(sql,[offset,pageSize],(err,result)=>{
       if(err) throw err;
       res.send({code:1,data:result});
  //5.获取数据库库返回结果并且发送脚手架 {code:1,data:[]}
      
  })
});
// 商品详情
server.get("/findProduct",(req,res)=>{
  // 1.参数id商品编号
  var id = req.query.uid;
  //2.创建SQL查询
  var sql = "select * from tea_shop where uid=?"
  //3.执行SQL 向数据库发送sql请求 把获取的的数据返回页面 
  pool.query(sql,[id],(err,result)=>{
    if(err) throw err;
    res.send({code:1,data:result})
    
  })
  
})
server.get("/findProduct1",(req,res)=>{
  var id = req.query.uid;
  var sql2 = "select * from tea_img where uid=?";
  pool.query(sql2,[id],(err,result)=>{
    if(err) throw err;
    res.send(result);
  });
})

 //功能五:新闻分页显示
 server.get("/newsList",(req,res)=>{
  //*参数    pno 页码 pageSize 页大小
  var pno = req.query.pno;
  var pageSize = req.query.pageSize; 
  //*默认值  1   6
  if(!pno){pno=1}
  if(!pageSize){pageSize=6}
  var sql = " SELECT * from tea_news limit ?,?";
      // sql +=" point,tu";
      // sql +=" FROM tea_news";
      // sql +=" LIMIT ?,?";
  var offset = (pno-1)*pageSize;
  pageSize = parseInt(pageSize);
  pool.query(sql,[offset,pageSize],(err,result)=>{
       if(err)throw err;
       res.send({code:1,data:result});
      //  console.log(result);
  });
});
//新闻详情 
server.get("/newsInfo",(req,res)=>{
  //1:获取客户参数 nid
  // var nid = req.query.nid;
  //2:拦载用户非法参数
  // var reg = /^[0-9]{1,}$/;
  // if(!reg.test(nid)){
  //    res.send({code:-1,msg:"参数格式不正确"});
  //    return;
  // }
  var id = req.query.id;
  var sql = "SELECT id,nname,ntime,ntext,img";
  sql +=" FROM tea_newsx WHERE id = ?";
  // nid = parseInt(nid);
  pool.query(sql,[id],(err,result)=>{
    if(err)throw err;
    res.send({code:1,data:result});
  })
  //3:{code:1,data:[]}
});

//添加购物车
server.get('/gwc',(req,res)=>{
  var uname=req.query.uname;
  var nname=req.query.nname;
  var img=req.query.img;
  var pice=req.query.pice;
  var gram=req.query.gram;
  var tmp=req.query.tmp;
  var sql='insert into tea_gwc values(?,?,?,?,?,?,?)';
  pool.query(sql,[null,uname,nname,img,pice,gram,tmp],(err,result)=>{
    if(err) throw err;
    res.send(result);
  })
});

//查询购物车
server.get('/gwc1',(req,res)=>{
  var uname=req.query.uname;//获取用户名
    sql='select * from tea_gwc where uname=?';
    pool.query(sql,[uname],(err,result)=>{
      if(err) throw err;
      res.send(result);
    })
});

//功能十:删除购物车中某个商品
server.post("/removeItem",(req,res)=>{
  var id = req.body.id;
  var sql = " DELETE FROM tea_gwc";
  sql+=" WHERE id = ?";
  id = parseInt(id);
  pool.query(sql,[id],(err,result)=>{
    if(err)throw err;
    //执行sql语句影响行数 
    //INSERT UPDATE DELETE 判断条件
    if(result.affectedRows > 0){
       res.send({code:1,msg:"删除成功"});
    }else{
      res.send({code:-1,msg:"删除失败"});
    }
  })
});
//功能十一:删除用户选中(多个)商品
server.get("/removeMItem",(req,res)=>{
//1:参数
var ids = req.query.ids;
//2:sql
var sql = "DELETE FROM tea_gwc";
sql+=" WHERE id IN ("+ids+")";
//3:json
pool.query(sql,(err,result)=>{
  if(err)throw err;
  if(result.affectedRows>0){
    res.send({code:1,msg:"成功删除多个商品"})
  }else{
    res.send({code:-1,msg:"删除失败"});
  }
})
}); 

//更改商品个数
server.get('/gs',(req,res)=>{
  var id = req.query.id;
  var geshu = req.query.geshu;
  var sql='update tea_gwc set geshu =? where id=?';
  pool.query(sql,[geshu,id],(err,result)=>{
    if(err) throw err;
    res.send(result);
  })
});
// 用户注册
server.get('/reg',(req,res)=>{
  var uname = req.query.uname;
  var sql1='select * from tea_user where uname=?';
  var upwd = req.query.upwd;
  var phone = req.query.phone;
  var sql = 'insert into tea_user values(?,?,?,?)';
  pool.query(sql1,[uname],(err,result)=>{
    if(err) throw err;
    if(result.length>0){
      return res.send({msg:'用户名已存在'});
    }else{
      pool.query(sql,[null,uname,upwd,phone],(err,result)=>{
        if(err) throw err;
        res.send({msg:'注册成功'});
      })
    }
  });
  
});

server.get('/dl',(req,res)=>{
  var uname=req.query.uname;
  var upwd=req.query.upwd;
  if(!uname){
    return res.send('用户名为空');
  }
  if(!upwd){
    return res.send('密码为空');
  }
  var sql='select uname,upwd from tea_user where uname=? and upwd=?';
  pool.query(sql,[uname,upwd],(err,result)=>{
    if(err) throw err;
    if(result.length>0){
      res.send('登陆成功');
    }else{
      res.send('密码或账号错误');
    }
  });
});