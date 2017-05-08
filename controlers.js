const db=require('./myStorage');
var DB = new db.myDB('./data');

const mng=require('mongoose');
const my_conn_data = "mongodb://al224938:labora2000@ds117821.mlab.com:17821/mydb";

var dbMongo = mng.connect(my_conn_data);

var  itemSchema = new mng.Schema({
	"@context": String,
	"@type": String,
	"@id": String,
	"query": String,
	"agent":String,
	"startTime": Date, 
	"url": String,		
});

var ItemModel = mng.model('Item', itemSchema);


function insertMongoDB(name, query){
	
	var jsonLd = new ItemModel(createJSONLD(name, query));

	jsonLd.save(function(err){
		if(err) throw err;
		console.log("Guardado");
		mng.connection.close();
	});	
}

function getGraphMongoDB(callback){

	ItemModel.find(function(err, data){
		if(err) return console.error(err);
		console.log(data);	
		callback(data);
	});
}


function createJSONLD(name, query){
	var dev = {
		"@context":"http://schema.org",
		"@type":"SearchAction",
		"@id":name,
		"query":query,
		"agent":"Creador fijo",
		"startTime":new Date(), 
		"url":"http://localhost:8000/dataset",		
	}
	return dev;

}



function getGraph(callback){

	var datasets=DB.getDatasets();
	
	var promises = datasets.map(function(name){
		
		return new Promise((resolve, reject) =>
		{
			DB.getDatasetInfo(name, function(data){
				resolve(data.result);
			});
		}); 
	});

	Promise.all(promises).then(values =>
	{
		values.map(function(x){
			delete x['@context'];
		});
		callback({'@context':'http://schema.org',
			  '@graph': values});
	});
}

function getPolaridad(name, n, callback){
	DB.getLastObjects(name, n, function(data, name){
		var positive=0;
		var negative=0;
		var neutral=0;
		for(var i in data.result){
			var pol = data.result[i].tweetPolaridad;
			if(pol == 0){
				neutral ++;
			}else if(pol > 0){
				positive ++;
			}else{
				negative ++;
			}
		}
		var dev={positive: positive, negative: negative, neutral:neutral};
		callback({result:dev});
	})
}

function getHistograma(name, top, n, callback){
	DB.getLastObjects(name, n, function(data, name){
		var dir = {};	
		for(var i in data.result){
			var text = data.result[i].tweetText.toLowerCase().split(' ');
			for(var j in text){
				if(!dir.hasOwnProperty(text[j])){
					dir[text[j]] = 0;
				}
				dir[text[j]]++;
			}
		}
		var list = [];
		for(var k in dir){
			list.push([k, dir[k]*5]);
		}
		list.sort(function(x, y){return y[1]-x[1];});
		
		list = list.slice(0, top); 
		callback({result: list});
	})
}

function getGeo(name, callback){
	DB.getLastObjects(name, 100, function(data, name){
		var lista = [];
		for (var i in data.result){
			var coor = data.result[i].tweetCordinates;
			var id = data.result[i].tweetId;
			if(coor != null){
				lista.push([id, coor]);
			}
		}
		callback({result:lista});
	});
}

function getLastTweets(name, limit, callback){
	DB.getLastObjects(name, limit, function(data, name){
		var lista = [];
		for(var i in data.result){
			var id = data.result[i].tweetId;
			lista.push(id);
		}
		callback({result:lista});
	})
}

exports.getPolaridad = getPolaridad
exports.getHistograma = getHistograma
exports.getGeo = getGeo
exports.getLastTweets = getLastTweets
exports.createJSONLD = createJSONLD
exports.getGraph = getGraph
exports.insertMongoDB = insertMongoDB
exports.getGraphMongoDB = getGraphMongoDB
