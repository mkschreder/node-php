NodePHP - run wordpress (and other php scripts) with node
---------------------------------

With Node PHP you can leverage the speed of node js and run all of the widely available php scripts directly inside your express site. 

To run wordpress with node js and express do this: 

	var express = require('express');
	var php = require("php"); 
	var path = require("path"); 
	
	var app = express();
	
	app.use("/", php.cgi("/path/to/wordpress")); 

	app.listen(9090);

	console.log("Server listening!"); 

Dependencies
------------

* php-cgi - you need to have the interpreter installed in order to use this extension
