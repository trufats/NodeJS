const Twitter = require('twitter')
const myCreds = require('./credentials/my-credential.json');

const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');

var db=require('./myStorage'),
    DB=new myDB('./data')

var controler = require('./controlers.js')

class StreamManager{
   constructor(){
      this.streams={};
   }

   addStream(name,query){
      var stream = client.stream('statuses/filter', {track: query});
      this.streams[name] = stream;
       
      //DB.createDataset(name, {query: query, name:name});

      DB.createDataset(name, controler.createJSONLD(name, query));

      stream.on('data', function(tweet) {
         //filter lang here?
         //console.log(name);
         //console.log(tweet.id_str);
         //console.log(tweet.text);
         //console.log(tweet.coordinates);
         //console.log(sentiment(tweet.text).score);
         
         var aux=null; 
         if (tweet.coordinates!=null) aux=tweet.coordinates.coordinates;

         var json = {tweetId: tweet.id_str, tweetText: tweet.text, tweetCordinates: aux, tweetPolaridad: sentiment(tweet.text).score}

         DB.insertObject(name, json);
      });

      stream.on('error', function(err){
         console.log(err);
      });
   }

   deleteStream(name){
      this.streams[name].destroy();
      delete this.streams[name];
   }
}

exports.StreamManager = StreamManager;

//var myManager = new StreamManager();

//myManager.addStream('coches', 'opel,mercedes,bmw');
//setTimeout(()=>{myManager.deleteStream('coches')},60000);

//myManager.addStream('ropa', 'falda,vestido,camisa');
//setTimeout(()=>{myManager.deleteStream('ropa')},60000);

//myManager.addStream('concierto', 'concierto,musica,arenal');
//setTimeout(()=>{myManager.deleteStream('concierto')},60000);

//myManager.addStream('cafeteria', 'cafe,cafeteria,bar');
//setTimeout(()=>{myManager.deleteStream('cafeteria')},60000);

//myManager.addStream('verano', 'sol,vacaciones,fiesta');
//setTimeout(()=>{myManager.deleteStream('verano')},60000);

//console.log(myManager);


