var app = require("express")();
var session = require('express-session');
var mysql = require("mysql");
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require("socket.io")(http);
var fs= require("fs");



//initialize the session
app.use(session({
    secret: "online",
    resave: true,
    saveUninitialized: true
}));
var session_data;


app.use(require("express").static(__dirname + '/data'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

/* Creating MySQL connection.*/
var con    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   'prab',
      database          :   'angular'
});


app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});



io.on('connection',function(socket){  
    socket.on('update_list',function(data){
      //data.purpose;
      
      
      if((String(data.purpose.trim()))=='login'){
        var query="update user set online = ? where id = ?";
        con.query(String(query),['Y',data.id],function(err,rows){
         // var query="select * from user where id !='"+data.id+"'";
          var query="select * from user";
          con.query(String(query),function(err,rows){
            io.emit('logout update',JSON.stringify(rows));
          });
        });
      }else{
        var query="update user set online = ? where id = ?";
        con.query(String(query),['N',data.id],function(err,rows){
          //var query="select * from user where id !='"+data.id+"'";
          var query="select * from user";
          con.query(String(query),function(err,rows){
            io.emit('logout update',JSON.stringify(rows));
          });
        });
      }
    });
});

app.post('/login', function (req, res) {
  session_data=req.session;
  //console.log(req.param('name')); // depricated
  data = {
    name:req.body.name,
    password:req.body.password,
  };
  session_data.password=data.password;
  session_data.name=data.name;
  var obj={};
  var query="select * from user where name='"+data.name+"' and password='"+data.password+"'";
      con.query(String(query),function(err,rows){
        if(rows.length > 0){
          var un=new Buffer(String(rows[0].name)).toString('base64');
          var ui=new Buffer(String(rows[0].id)).toString('base64');
          obj.path_name="/home.html#?un="+un+"&ui="+ui;
          res.write(JSON.stringify(obj));
          res.end();
        }else{
          obj.path_name="invalid";
          res.write(JSON.stringify(obj));
          res.end();
        }
    });
});

app.get('/home', function (req, res) {
  session_data=req.session;
  if(session_data.name){
    res.sendFile(__dirname + '/data/home.html');
  }else{
    res.redirect('/');
  }
});

app.post('/get_list', function (req, res) {
  var query="select * from user";
  con.query(String(query),function(err,rows){
    res.write(JSON.stringify(rows));
    res.end();
  });
});

app.post('/logout', function (req, res) {
  var query="update user set online = ? where id = ?";
  con.query(String(query),['N',req.body.id],function(err,rows){});
  req.session.destroy(function(err){
  res.end();
  });
});


app.post("/upload",function(req,res){
    var multiparty = require('multiparty');
   var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
       //res.send("name:"+fields.name);
       
       var img =files.images[0];
       var fs = require("fs");
      // console.log(img.path);
       fs.readFile(img.path,function(err,data){
        var path ="/home/prab/Chat/data/img/uploads/"+img.originalFilename;
       // console.log(path);
        fs.writeFile(path,data,function(error){
          if(error)console.log("error");
          res.send("upload success and file saved to '"+path+"'");
        });
       });
    });
  });

app.post('/register',function(req,res)
{
 

var idnum=0;
var prequery="select * from user";
con.query(String(prequery),function(err,rows)
  {
      if(!err)
        
        {
          idnum=rows.length;

var data =
{
  id: idnum+1,
  name: req.body.username,
  password: req.body.regpass,
  online: 'N'
};

 
var query = con.query('INSERT INTO user SET ?', data, function(err, result) {
       if(err)
        res.end("Erorr");
      else
        res.sendFile(__dirname + '/data/back.html');
        

  
});
            

        }

  });



});
//console.log(query.sql);

app.post('/redirect',function(req,res)
  {
     res.sendFile(__dirname + '/data/index.html');

  });



app.post('/message',function(req,res)
  {
  	//console.log("Wtf");
  res.sendFile(__dirname + '/data/chat.html');
   
 });


app.post('/my_images', function(req, res) { // create download route

app.use(require("express").static(__dirname + '/data/img/uploads'));
  var path=require('path'); // get path

  var dir=path.resolve(".")+'/data/img/uploads'; // give path
   
    
    fs.readdir(dir, function(err, list) { // read directory return  error or list

    if (err) return res.json(err);

    else
               console.log(list);
                var file=list[0];
                //console.log(__dirname);
                var img = fs.readFileSync(__dirname + '/data/img/uploads/' + file);
                res.writeHead(200, {'Content-Type': 'image/jpg' });
                res.end(img, 'binary');

               //res.render('image_list.jade', {results:list});

                //res.end("<html><head><title>Download</title></head> <body><form action='/downloadfile'> <input type='submit' value='Download'/></form> </body></html>");


                });
                
      

});


app.get('/oneimage',function(req,res)
	{


var path=require('path'); // get path

  var dir=path.resolve(".")+'/uploads/'; // give path
   
    
    
    fs.readdir(dir, function(err, list) { // read directory return  error or list

    if (err) return res.json(err);

    else

		        var img = fs.readFileSync('/home/prab/Chat/data/img/uploads/img4.jpg');
                res.writeHead(200, {'Content-Type': 'image/jpg' });
                res.end(img, 'binary');

	});
});


 io.on('connection', function(socket){ 
  socket.on('chatMessage', function(from, msg){
    io.emit('chatMessage', from, msg);
  });
  socket.on('notifyUser', function(user){
    io.emit('notifyUser', user);
  });
});

http.listen(3000,function(){
    console.log("Server Running on 3000");
});
