var express = require('express');
var php = require("./main"); 
// var php = require("phpcgijs"); 
var path = require("path"); 

var app = express();

app.use("/", php.cgi(__dirname + "/test/php"));
app.listen(9090);
console.log("Server listening at 9090!");
