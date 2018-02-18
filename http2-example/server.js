var express = require('express')
var app = express()
var fs = require('fs')
var spdy = require('spdy');

app.get('/hello', function (req, res) {
  console.log('res');
  res.send('hello, http2!')
})

var options = {
  key: fs.readFileSync('./certs/priv.key'),
  cert: fs.readFileSync('./certs/priv.crt')
};

spdy.createServer(options, app).listen(8081);
