var http    = require('http');
var spawn   = require('child_process').spawn;
var crypto  = require('crypto');
var url     = require('url');

var secret  = 'amazingkey'; // secret key of the webhook
var port    = 8081; // port

function resHeadJson(res,code){
        var value = {"Content-Type": "application/json"};
        res.writeHead(code, value);
}

http.createServer(function(req, res){
    
    
    
    var path = url.parse(req.url).pathname;
    console.log("request received at: ",path);
    

    if(path!='/push' || req.method != 'POST'){
       var data = JSON.stringify({"error": "invalid request"});
       resHeadJson(res,400);
       return res.end(data); 
    }


    var jsonString = '';
    req.on('data', function(data){
        jsonString += data;
    });

    req.on('end', function(){
      var hash = "sha1=" + crypto.createHmac('sha1', secret).update(jsonString).digest('hex');
      if(hash != req.headers['x-hub-signature']){
          console.log('invalid key');
          var data = JSON.stringify({"error": "invalid key", key: hash});
          resHeadJson(res,403)
          return res.end(data);
      } 
       
      console.log("running hook.sh");
   
      var deploySh = spawn('sh', ['hook.sh']);
      deploySh.stdout.on('data', function(data){
          var buff = new Buffer(data);
          console.log(buff.toString('utf-8'));
      });

    resHeadJson(res,202);
    var data = JSON.stringify({"success": true});
    
    return res.end(data);
 
    });

    
}).listen(port);

console.log("Server listening at " + port);
