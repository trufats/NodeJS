const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser");

const db=require('./myStorage');
const controler = require('./controlers.js');
const myStreams = require('./myStream.js');

var stream = new myStreams.StreamManager();

var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var DB=new myDB('./data');

app.post('/stream', function(req, res){
    var name = req.body.name;
    var track = req.body.query;
    
    controler.insertMongoDB(name, track);

    stream.addStream(name, track, function(data){
	res.send(data);
    });
});

app.get('/',function(req,res){
    res.sendFile("public/index.html",{root:application_root});
});

app.get('/dataset',function(req,res){
    res.send({result: DB.getDatasets()});
});

app.get('/dataset/:name',function(req,res){
    if(req.query.limit == null){	
	var n = (req.query.n == null) ? 10 : parseInt(req.query.n);
	DB.getLastObjects(req.params.name,n,function(data){
	        res.send(data);
	})
    }else{
	var limit = parseInt(req.query.limit);
	controler.getLastTweets(req.params.name, limit, function(data){
		res.send(data);
	})
    }
});

app.get('/dataset/:name/polaridad',function(req,res){
    var n = (req.query.n == null) ? 100 : parseInt(req.query.n);
    controler.getPolaridad(req.params.name, n, function(data){
        res.send(data);	
    })
});

app.get('/dataset/:name/words',function(req,res){
    var n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    controler.getHistograma(req.params.name, req.query.top, n, function(data){
        res.send(data);	
    })
});

app.get('/dataset/:name/geo', function(req, res){
    controler.getGeo(req.params.name, function(data){
	res.send(data);
    })
});

app.get('/dataset/stream/graph', function(req, res){
    //controler.getGraph(function(data){
    controler.getGraphMongoDB(function(data){
	res.send(data);
    })
});


//Levanta el servidor cuando la BD este lista
//db.warmupEmmitter.once("warmup",() => {
//   console.log("Web server running on port 8000");
//   app.listen(8000);
//});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

//Levanta el servidor cuando la BD este lista
db.warmupEmmitter.once("warmup",() => {
  app.listen(server_port, server_ip_address, function(){
    console.log("Listening on " + server_ip_address + ", server_port " + server_port)
  });
   //console.log("Web server running on port 8000");
   //app.listen(8000);
});
