.. node-php documentation master file, created by
   sphinx-quickstart on Sat May  2 20:11:07 2020.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Node-PHP
========

What if you could host wordpress on nodejs? This project makes it possible.

NodePHP is a small script I wrote a long time ago when I was experimenting with
NodeJS when it was still in it's infancy. I like the nodejs express framework
and the way it made it possible to quickly set up http servers.

I had a website running that was served by a nodejs server and I wanted to add
wordpress installation to that website. So I decided why not make it possible
to run php scripts using php-cgi and then serve the results with node? This is
how original NodePHP came about. Since then it has been expanded by other
people and made better. 

Usage:

.. code-block: javascript

    var express = require('express');
    var php = require("node-php");
    var path = require("path");

    var app = express();
    var p = path.join("test/php");

    app.use("/", php.cgi(p, { cgi_path: '/usr/bin/', options: { "-c": "/etc/php.ini" } }));
    app.listen(9090, '127.0.0.1');
    console.log("Server listening at 9090!");

Run unit tests:

.. code-block: bash

    npm install chai supertest express shelljs php-cgi
    npm test

Indices and tables
------------------

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
