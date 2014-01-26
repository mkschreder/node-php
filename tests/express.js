var express = require('express');
var php = require("php"); 
var path = require("path"); 
var cluster = require("cluster"); 
var request = require("request"); 

if(cluster.isMaster){
	cluster.fork().on("message", function(){
		process.exit();
	}); 
	
	var app = express();
	
	app.use("/", php.cgi(__dirname)); 

	app.listen(9090);
} else {
	request("http://localhost:9090/test.php", function(err, res){
		if(res.body == "Hello World!"){
			console.log("Success!"); 
		} else {
			console.error("Expected 'Hello World!', got: "+res.body); 
		}
		process.send("exit"); 
	}); 
}

