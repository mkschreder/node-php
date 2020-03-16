var express = require('express');
var php = require("./main"); 
// var php = require("phpcgijs"); 
var path = require("path"); 

var app = express();

var p = path.join(__dirname, "test/php")

app.use("/", php.cgi(p));
app.listen(9090, '127.0.0.1');
console.log("Server listening at 9090!");
