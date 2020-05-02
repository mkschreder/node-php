/* eslint-env mocha */

var request = require('supertest');
var assert = require('chai').assert;
var express = require('express');
var php = require('../main');
var path = require("path")

var app = express();

app.use('/', php.cgi(path.join(__dirname, '../', '/test/php')));

describe('GET /', function() {
  it('should respond with /index.php and valid $_SERVER variable', function(done) {
    request(app)
      .get('/')
      .set('Accept', ['application/json', 'text/html'])
      // .expect('Content-Type', /html/)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
});

describe('Get /index.php', function() {
  it('should return a valid $_SERVER variable', function(done) {
    request(app)
      .get('/index.php')
      .set('Accept', ['application/json', 'text/html'])
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          assert.match(res.body.$_SERVER.REMOTE_ADDR, /127.0.0.1|::1/);
          assert.match(res.body.$_SERVER.SCRIPT_FILENAME, /index.php$/);
          done();
        }
      });
  });
});


describe('Get /test/index.php', function() {
  it('should return a 404 error for /test/index.php', function(done) {
    request(app)
      .get('/test/index.php')
      .set('Accept', ['application/json', 'text/html'])
      .expect('Content-Type', /html/)
      .expect(404)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
});

describe('Get /test', function() {
  it('should return a 404 for /test', function(done) {
    request(app)
      .get('/test')
      .set('Accept', ['application/json', 'text/html'])
      .expect('Content-Type', /html/)
      .expect(404)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
});


describe('Get /test/', function() {
  it('should return a 404 for /test/', function(done) {
    request(app)
      .get('/test/')
      .set('Accept', ['application/json', 'text/html'])
      .expect('Content-Type', /html/)
      .expect(404)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
});