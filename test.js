var http = require('http')
var connect = require('connect')
var locat = require('./')

var untrusted = function (request, response) {
  response.writeHead(204, {
    'x-locat': locat(request, false)
  })
  response.end()
}

var trusted = function (request, response) {
  response.writeHead(204, {
    'x-locat': locat(request)
  })
  response.end()
}

var server

exports.tearDown = function (callback) {
  server.close(callback)
}

exports['Without proxy'] = {
  'http://localhost:3000/': function (test) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get('http://localhost:3000/', function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://localhost:3000/')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  },

  'http://foo:bar@localhost:3000/': function (test) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get('http://foo:bar@localhost:3000/', function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://foo:bar@localhost:3000/')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  },

  'http://localhost:3000/foo?bar': function (test) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get('http://localhost:3000/foo?bar', function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://localhost:3000/foo?bar')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  },

  'http://localhost:3000/foo?bar with connect': function (test) {
    var app = connect()
    app.use('/foo', untrusted)
    server = http.createServer(app)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get('http://localhost:3000/foo?bar', function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://localhost:3000/foo?bar')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  }
}

exports['With untrusted proxy'] = {
  'https://localhost:3000/': function (test) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get({
        hostname: 'localhost',
        port: 3000,
        headers: {
          'x-forwarded-proto': 'https'
        }
      }, function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://localhost:3000/')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  },

  'http://example.com/': function (test) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      test.ifError(error)
      http.get({
        hostname: 'localhost',
        port: 3000,
        headers: {
          'x-forwarded-host': 'example.com'
        }
      }, function (response) {
        test.strictEqual(
          response.headers['x-locat'],
          'http://localhost:3000/')
        response.read()
        test.done()
      }).on('error', test.done)
    })
  }
}

exports['With trusted proxy'] = {
  'Use not standard forwarded header': {
    'https://localhost:3000/ with x-forwarded-proto': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'x-forwarded-proto': 'https'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/ with multiple x-forwarded-proto': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'x-forwarded-proto': 'https,http,https'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/ with front-end-https': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'front-end-https': 'on'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/ with x-forwarded-ssl': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'x-forwarded-ssl': 'on'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/ with x-url-scheme': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'x-url-scheme': 'https'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'http://example.com/': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'x-forwarded-host': 'example.com'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'http://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    }
  },

  'Use standard forwarded header': {
    'http://example.com/': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': 'host=example.com'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'http://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'http://example.com/ with multiple forwarded hosts': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': ['host=example.com', 'host=example.net']
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'http://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'http://example.com/ with multiple forwarded hosts in one header': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': 'host=example.com, host=example.net'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'http://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': 'proto=https'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://localhost:3000/ with multiple forwarded headers': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': ['proto=https', 'proto=http']
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://localhost:3000/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://example.com/ with one forwarded endpoint': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': 'proto=https;host=example.com'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    },

    'https://example.com/ with two forwarded endpoints in one header': function (test) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        test.ifError(error)
        http.get({
          hostname: 'localhost',
          port: 3000,
          headers: {
            'forwarded': 'proto=https, host=example.com'
          }
        }, function (response) {
          test.strictEqual(
            response.headers['x-locat'],
            'https://example.com/')
          response.read()
          test.done()
        }).on('error', test.done)
      })
    }
  }
}
