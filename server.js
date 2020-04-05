var express = require('express');
var php = require("./main");
// var php = require("phpcgijs"); 
var path = require("path");

var app = express();
var p = path.join("test/php");

app.use("/", php.cgi(p, { cgi_path: '/usr/bin/', options: { "-c": "/etc/php.ini" } }));
app.listen(9090, '127.0.0.1');
console.log("Server listening at 9090!");
