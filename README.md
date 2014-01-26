<center>![Node PHP](https://raw2.github.com/mkschreder/siteboot_php/master/node_php_small.jpg)</center>
NodePHP - run wordpress (and other php scripts) with node
---------------------------------

With Node PHP you can leverage the speed of node js and run all of the widely available php scripts directly inside your express site. 

Installation
------------

	npm install node-php
	
Usage
-----

To run wordpress with node js and express do this: 

	var express = require('express');
	var php = require("php"); 
	var path = require("path"); 
	
	var app = express();
	
	app.use("/", php.cgi("/path/to/wordpress")); 

	app.listen(9090);

	console.log("Server listening!"); 

Explanation
-----------

The script will pipe all files that end in the .php extension through the php parser. All other files will be served as static content. 

Basic permalinks are supported but the support for them can probably be improved. 

Dependencies
------------

* php-cgi - you need to have the interpreter installed in order to use this extension
