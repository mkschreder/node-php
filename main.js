// License: MIT
// Copyright (c) 2014-2016 Martin K. Schröder <mkschreder.uk@gmail.com>

/* eslint no-console: 0 */

var URL = require('url');
var child = require('child_process');
var path = require('path');
var fs = require('fs');
var shell = require('shelljs');

var PHP_CGI = shell.which('php-cgi').toString();

if (!PHP_CGI) {
  throw new Error('"php-cgi" cannot be found');
}

function findFile(url, phpdir, callback) {
  var file = path.join(phpdir, url.pathname);

  fs.stat(file, function (err, stat) {

    // file does not exist
    if (err || stat.isDirectory()) {
      file = path.join(err ? phpdir : file, 'index.php');
      fs.exists(file, function (exists) {
        callback(exists && file);
      });
    }
    // file found
    else {
      callback(file);
    }

  });
}

function runPHP(req, response, next, url, file) {
  var pathinfo = '';
  var i = req.url.indexOf('.php');
  if (i > 0) pathinfo = url.pathname.substring(i + 4);
  else pathinfo = url.pathname;

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
    ALL_HTTP: Object.keys(req.headers).map(function (x) {
      return 'HTTP_' + x.toUpperCase().replace('-', '_') + ': ' + req.headers[x];
    }).reduce(function (a, b) {
      return a + b + '\n';
    }, ''),

    // All HTTP headers as sent by the client in raw form. No transformation on the header names is applied.
    ALL_RAW: Object.keys(req.headers).map(function (x) {
      return x + ': ' + req.headers[x];
    }).reduce(function (a, b) {
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

    // The CGI Specification version supported by the web server; always set to CGI/1.1.
    GATEWAY_INTERFACE: 'CGI/1.1',

    // The HTTP protocol version used by the current request.
    SERVER_PROTOCOL: '',

    // The IP address of the computer that sent the request.
    REMOTE_ADDR: req.ip || '',

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

  Object.keys(req.headers).map(function (x) { return env['HTTP_' + x.toUpperCase().replace('-', '_')] = req.headers[x]; });

  if (/.*?\.php$/.test(file)) {
    var res = '', err = '';

    var php = child.spawn(PHP_CGI, [], {
      env: env
    });

    // php.stdin.resume();
    // console.log(req.rawBody);
    // (new Stream(req.rawBody)).pipe(php.stdin);
    php.stdin.on('error', function () { });
    req.pipe(php.stdin); // pipe request stream directly into the php process
    req.resume();
    // php.stdin.write('\n');

    // php.stdin.end();

    php.stdout.on('data', function (data) {
      // console.log(data.toString());
      res += data.toString();
    });
    php.stderr.on('data', function (data) {
      err += data.toString();
    });
    php.on('error', function (err) {
      console.error(err);
    });
    php.on('exit', function () {
      // extract headers
      php.stdin.end();

      var lines = res.split('\r\n');
      var line = 0;
      var html = '';
      if (lines.length) {
        do {
          var m = lines[line].split(': ');
          if (m[0] === '') break;

          // console.log('HEADER: '+m[0]+': '+m[1]);
          if (m[0] == 'Status') {
            response.statusCode = parseInt(m[1]);
          }
          if (m[0] == 'Set-Cookie') {
            var prevCookies = response.getHeader('Set-Cookie');
            if (prevCookies) {
              if (typeof prevCookies == 'string') {
                m[1] = [prevCookies, m[1]];
              } else {
                prevCookies.push(m[1]);
                m[1] = prevCookies;
              }
            }
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
      // console.log(html);
      response.status(response.statusCode).send(html);
      response.end();
    });

  } else {
    response.sendFile(file);
    //response.end();
    //next();
  }
}

exports.cgi = function (phproot) {
  return function (req, res, next) {
    req.pause(); // stop stream until child-process is opened

    var url = URL.parse(req.url);
    findFile(url, phproot, function (file) {

      if (file) {
        runPHP(req, res, next, url, file);
      } else {
        next();
      }

    });
  };
};
