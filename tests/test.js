var request = require('supertest');
var assert = require('chai').assert;
var express = require('express');
var php = require('../main');

var app = express();

app.use('/', php.cgi(__dirname + '/php'));

describe('GET /', function() {
  it('should respond with /index.php', function(done) {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          assert.match(res.body.$_SERVER.SCRIPT_FILENAME, /index.php$/);
        }
        done();
      });
  })
});

describe('Get /index.php', function() {
  it('should return a valid $_SERVER variable', function(done) {
    request(app)
      .get('/index.php')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          assert.match(res.body.$_SERVER.REMOTE_ADDR, /127.0.0.1|::1/);
        }
        done();
      });
  })
});
