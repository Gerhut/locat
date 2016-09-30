# locat

[![Build Status](https://travis-ci.org/Gerhut/locat.svg?branch=master)](https://travis-ci.org/Gerhut/locat)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Get location from Node.js request object

## Install

    $ npm install --save locat

## Usage

```javasccript
var locat = require('locat')
var http = require('http)

http.createServer(function (request, response) {
  var location = locat(request)
  response.end('You are now visiting ' + location)
}).listen(3000)
```

## License

MIT
