# locat

[![Greenkeeper badge](https://badges.greenkeeper.io/Gerhut/locat.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/Gerhut/locat.svg?branch=master)](https://travis-ci.org/Gerhut/locat)
[![codecov](https://codecov.io/gh/Gerhut/locat/branch/master/graph/badge.svg)](https://codecov.io/gh/Gerhut/locat)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![dependencies Status](https://david-dm.org/Gerhut/locat/status.svg)](https://david-dm.org/Gerhut/locat)
[![devDependencies Status](https://david-dm.org/Gerhut/locat/dev-status.svg)](https://david-dm.org/Gerhut/locat?type=dev)

Get location from Node.js request object

## Install

    $ npm install --save locat

## Usage

```javascript
var locat = require('locat')
var http = require('http')

http.createServer(function (request, response) {
  var location = locat(request)
  response.end('You are now visiting ' + location)
}).listen(3000)
```

## License

MIT
