
NodeCGIEmbedded - run php scripts like wordpress, drupal, etc with node and cgi counter parts
---------------------------------------------------------

With Node PHP Embedded you can leverage the speed of node js and run all of the widely available php scripts directly inside your express site. 

This is a fork of http://github.com/mkschreder/node-php and has been modified for making this take dynamic PHP pathing, so that it can run without a PHP distribution installed on a machine and can work with an embedded PHP binary distribution.



Installation
------------

```
npm install phpcgijs --save
```

Usage
-----

To run php scripts with node js and express create the following script like below: 

```javascript

var express = require('express');
var php = require("./main");
// var php = require("phpcgijs"); 
var path = require("path");

var app = express();
var p = path.join("test/php");

// Following is the structure for providing the declaration of paths and options:

// app.use("/", php.cgi(
//             "/path/to/phpscript.php", 
//             {
//                 "options": {"-c": "/to/php/ini/path/php.ini"}
//             }
//         ));

// Following works without a local PHP-CGI path and tries to 
//          use PHP-CGI installed in system by default:

// app.use("/", php.cgi("/path/to/phpscript")); 

// Following uses a path in second argument defining the local copy of 
//          PHP-CGI that you want to use for the application

// app.use("/", php.cgi(
//             "/path/to/phpscript.php", 
//             {
//                 "cgi_path":"to/php/cgi/path/php-cgi",
//                 "options": {"-c": "/to/php/ini/path/php.ini"}
//             }
//         ));

// options are PHP-CGI command line options and can be found in documentation
// It can also be found in readme-php-options.txt (check for update in docs)

app.use("/", php.cgi(p, { cgi_path: '/usr/bin/', options: { "-c": "/etc/php.ini" } }));
app.listen(9090, '127.0.0.1');
console.log("Server listening at 9090!");

```

Explanation
-----------

The script will pipe all files that end in the .php extension through the php parser. All other files will be served as static content. 

Basic permalinks are supported but the support for them can probably be improved. 

Dependencies
------------

# php-cgi

* You need to have the interpreter installed in the system in order to use this extension.
* Alternatively, You can specify the full path of locally available php-cgi path. 
* If custom path not specified in express, it tries to find the system installed php-cgi executable. If still unavailable, the server errors out.
* TODO: 
    - Add php.ini path config
    - app.use("/", php.cgi("/path/to/phpscript", "to/php/cgi/path", '/path/to/php.ini')); 

License
-------

Copyright © 2019 - till it works Ganesh B <ganeshsurfs@gmail.com>

The MIT License (MIT) - See [LICENSE](./LICENSE) for further details.
