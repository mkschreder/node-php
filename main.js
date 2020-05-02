// License: MIT
// Copyright (c) 2014-2016 Martin K. Schröder <mkschreder.uk@gmail.com>
// Contribution: 2018 Ganesh K. Bhat <ganeshsurfs@gmail.com> Dynamic PHP-CGI path imports for supporting a embedded PHP Interpreter Distribution

/* eslint no-console: 0 */

const URL = require('url');
const child = require('child_process');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const util = require('util')

const PHP_CGI = shell.which('php-cgi');

function find_file(url, php_dir, callback) {
    var file = path.join(php_dir, url.pathname);

    fs.stat(file, function(err, stat) {
        // File does not exist
        if (err || stat.isDirectory()) {
            if (stat && stat.isDirectory()) {
                file = path.join(file, 'index.php');
            }
            if (file.includes(__dirname)) {
                fs.exists(file, function(exists) {
                    console.log("File path exists:", file, exists)
                    callback(exists && file);
                });
            } else {
                fs.exists(path.join(__dirname, file), function(exists) {
                    console.log("No file path exists:", file, exists)
                    callback(exists && file);
                });
            }
        }
        // file found
        else {
            callback(file);
        }
    });
}

function strOptions(options) {
    let optionsArray = Object.entries(options);
    let newArray = " ";
    for (let i = 0; i < optionsArray.length; i++) {
        newArray = newArray + (optionsArray[i][0] + " " + optionsArray[i][1] + " ");
    }
    return newArray;
}

function run_php(req, response, next, url, file, exe_config) {
    var pathinfo = '';
    var i = req.url.indexOf('.php');
    if (i > 0) {
        pathinfo = url.pathname.substring(i + 4)
    } else {
        pathinfo = url.pathname
    };

    // console.log("run_php pathinfo", pathinfo)
    // console.log("run_php req", req)

    var env = {
        SERVER_SIGNATURE: 'NodeJS server at localhost',

        // The extra path information, as given in the requested URL. In fact, scripts can be accessed by their virtual path, followed by extra information at the end of this path. The extra information is sent in PATH_INFO.
        PATH_INFO: pathinfo,

        // The virtual-to-real mapped version of PATH_INFO.
        PATH_TRANSLATED: '',

        // The virtual path of the script being executed.
        SCRIPT_NAME: url.pathname,

        SCRIPT_FILENAME: file,

        // The real path of the script being executed.
        REQUEST_FILENAME: file,

        // The full URL to the current object requested by the client.
        SCRIPT_URI: req.url,

        // The full URI of the current request. It is made of the concatenation of SCRIPT_NAME and PATH_INFO (if available.)
        URL: req.url,

        SCRIPT_URL: req.url,

        // The original request URI sent by the client.
        REQUEST_URI: req.url,

        // The method used by the current request; usually set to GET or POST.
        REQUEST_METHOD: req.method,

        // The information which follows the ? character in the requested URL.
        QUERY_STRING: url.query || '',

        // 'multipart/form-data', //'application/x-www-form-urlencoded', //The MIME type of the request body; set only for POST or PUT requests.
        CONTENT_TYPE: req.get('Content-Type') || '',

        // The length in bytes of the request body; set only for POST or PUT requests.
        CONTENT_LENGTH: req.get('Content-Length') || 0,

        // The authentication type if the client has authenticated itself to access the script.
        AUTH_TYPE: '',

        AUTH_USER: '',

        // The name of the user as issued by the client when authenticating itself to access the script.
        REMOTE_USER: '',

        // All HTTP headers sent by the client. Headers are separated by carriage return characters (ASCII 13 - \n) and each header name is prefixed by HTTP_, transformed to upper cases, and - characters it contains are replaced by _ characters.
        ALL_HTTP: Object.keys(req.headers).map(function(x) {
            return 'HTTP_' + x.toUpperCase().replace('-', '_') + ': ' + req.headers[x];
        }).reduce(function(a, b) {
            return a + b + '\n';
        }, ''),

        // All HTTP headers as sent by the client in raw form. No transformation on the header names is applied.
        ALL_RAW: Object.keys(req.headers).map(function(x) {
            return x + ': ' + req.headers[x];
        }).reduce(function(a, b) {
            return a + b + '\n';
        }, ''),

        // The web server's software identity.
        SERVER_SOFTWARE: 'NodeJS',

        // The host name or the IP address of the computer running the web server as given in the requested URL.
        SERVER_NAME: 'localhost',

        // The IP address of the computer running the web server.
        SERVER_ADDR: '127.0.0.1',

        // The port to which the request was sent.
        SERVER_PORT: 8011,

        // The IP address of the computer running the web server.
        SERVER_ADDR: '127.0.0.1',

        // The port to which the request was sent.
        SERVER_PORT: 8011,

        // The CGI Specification version supported by the web server; always set to CGI/1.1.
        GATEWAY_INTERFACE: 'CGI/1.1',

        // The HTTP protocol version used by the current request.
        SERVER_PROTOCOL: '',

        // The IP address of the computer that sent the request.
        REMOTE_ADDR: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress,

        // The port from which the request was sent.
        REMOTE_PORT: '',

        // The absolute path of the web site files. It has the same value as Documents Path.
        DOCUMENT_ROOT: '',

        // The numerical identifier of the host which served the request. On Abyss Web Server X1, it is always set to 1 since there is only a single host.
        INSTANCE_ID: '',

        // The virtual path of the deepest alias which contains the request URI. If no alias contains the request URI, the variable is set to /.
        APPL_MD_PATH: '',

        // The real path of the deepest alias which contains the request URI. If no alias contains the request URI, the variable is set to the same value as DOCUMENT_ROOT.
        APPL_PHYSICAL_PATH: '',

        // It is set to true if the current request is a subrequest, i.e. a request not directly invoked by a client. Otherwise, it is set to true. Subrequests are generated by the server for internal processing. XSSI includes for example result in subrequests.
        IS_SUBREQ: '',

        REDIRECT_STATUS: 1
    };

    Object.keys(req.headers).map(function(x) {
        return env['HTTP_' + x.toUpperCase().replace('-', '_')] = req.headers[x];
    });

    if (/.*?\.php$/.test(path.join(__dirname, file))) {
        var res = '',
            err = '';
        var php;

        if (!!exe_config.cgi_path && exe_config.cgi_path !== '') {
            console.log((exe_config.cgi_path.lastIndexOf("/") == exe_config.cgi_path.length - 1 ? exe_config.cgi_path : exe_config.cgi_path + "/") + "php-cgi" + strOptions(exe_config.options));

            php = child.spawn(
                (exe_config.cgi_path.lastIndexOf("/") == exe_config.cgi_path.length - 1 ?
                    exe_config.cgi_path : exe_config.cgi_path + "/") + "php-cgi",
                [strOptions(exe_config.options)], {
                    env: env
                });
        } else {
            if (!PHP_CGI) {
                throw new Error('"php-cgi" cannot be found');
            }
            php = child.spawn(PHP_CGI, [strOptions(exe_config)], {
                env: env
            });
        }

        // php.stdin.resume();
        // console.log(req.rawBody);
        // (new Stream(req.rawBody)).pipe(php.stdin);

        php.stdin.on('error', function() {
            console.error("Error from server")
        });

        // pipe request stream directly into the php process
        req.pipe(php.stdin);
        req.resume();

        // php.stdin.write('\n');
        // php.stdin.end();

        php.stdout.on('data', function(data) {
            res += data.toString();
        });
        php.stderr.on('data', function(data) {
            err += data.toString();
        });
        php.on('error', function(err) {
            console.error("error", err);
        });
        php.on('exit', function() {

            // extract headers
            php.stdin.end();

            var lines = res.split('\r\n');
            var line = 0;
            var html = '';
            if (lines.length) {
                do {
                    var m = lines[line].split(': ');
                    if (m[0] === '') break;
                    if (m[0] == 'Status') {
                        response.statusCode = parseInt(m[1]);
                    }
                    if (m.length == 2) {
                        response.setHeader(m[0], m[1]);
                    }
                    line++;
                } while (lines[line] !== '');

                html = lines.splice(line + 1).join('\n');
            } else {
                html = res;
            }

            // console.log('STATUS: '+response.statusCode);

            response.status(response.statusCode).send(html);
            response.end();
        });
    } else {
        response.sendFile(file);
    }
}

exports.cgi = function(php_root, exe_config) {
    return function(req, res, next) {

        // stop stream until child-process is opened
        req.pause();
        var url = URL.parse(req.url);

		if(!exe_config) {
			exe_config = { cgi_path: '/usr/bin/', options: { "-c": "/etc/php.ini" }};
		}

        file = find_file(url, php_root, function(file) {
            if (file) {
                // console.log("find_file call", exe_config.php_cgi_path, file);
                run_php(req, res, next, url, file, exe_config);
            } else {
                next();
            }
        })
    };
};
