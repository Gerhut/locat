/* eslint-env mocha */

var http = require('http')
var request = require('request')
var locat = require('./')

var untrusted = function (request, response) {
  try {
    return response.end(locat(request, false))
  } catch (e) {
    response.status = 500
    return response.end(e.stack)
  }
}

var trusted = function (request, response) {
  try {
    return response.end(locat(request))
  } catch (e) {
    response.status = 500
    return response.end(e.stack)
  }
}

var server

afterEach(function (done) {
  server.close(done)
})

describe('Without proxy', function () {
  it('http://localhost:3000/', function (done) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      if (error) return done(error)
      request('http://localhost:3000/', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost:3000/')
        done()
      })
    })
  })

  it('http://foo:bar@localhost:3000/', function (done) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      if (error) return done(error)
      request('http://foo:bar@localhost:3000/', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://foo:bar@localhost:3000/')
        done()
      })
    })
  })

  it('http://localhost:3000/foo?bar', function (done) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      if (error) return done(error)
      request('http://localhost:3000/foo?bar', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost:3000/foo?bar')
        done()
      })
    })
  })
})

describe('With untrusted proxy', function () {
  it('https://localhost:3000/', function (done) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      if (error) return done(error)
      request('http://localhost:3000/', {
        headers: {
          'x-forwarded-proto': 'https'
        }
      }, function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost:3000/')
        done()
      })
    })
  })

  it('http://example.com/', function (done) {
    server = http.createServer(untrusted)
    server.listen(3000, function (error) {
      if (error) return done(error)
      request('http://localhost:3000/', {
        headers: {
          'x-forwarded-host': 'example.com'
        }
      }, function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost:3000/')
        done()
      })
    })
  })
})

describe('With trusted proxy', function () {
  describe('Use not standard forwarded header', function () {
    it('https://localhost:3000/ with x-forwarded-proto', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'x-forwarded-proto': 'https'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://localhost:3000/ with multiple x-forwarded-proto', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'x-forwarded-proto': 'https,http,https'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://localhost:3000/ with front-end-https', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'front-end-https': 'on'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://localhost:3000/ with x-forwarded-ssl', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'x-forwarded-ssl': 'on'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://localhost:3000/ with x-url-scheme', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'x-url-scheme': 'https'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('http://example.com/', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'x-forwarded-host': 'example.com'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('http://example.com/')
          done()
        })
      })
    })
  })

  describe('Use standard forwarded header', function () {
    it('http://example.com/', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': 'host=example.com'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('http://example.com/')
          done()
        })
      })
    })

    it('http://example.com/ with multiple forwarded hosts', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': ['host=example.com', 'host=example.net']
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('http://example.com/')
          done()
        })
      })
    })

    it('http://example.com/ with multiple forwarded hosts in one header', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': 'host=example.com, host=example.net'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('http://example.com/')
          done()
        })
      })
    })

    it('https://localhost:3000/', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': 'proto=https'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://localhost:3000/ with multiple forwarded headers', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': ['proto=https', 'proto=http']
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://localhost:3000/')
          done()
        })
      })
    })

    it('https://example.com/ with one forwarded endpoint', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': 'proto=https;host=example.com'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://example.com/')
          done()
        })
      })
    })

    it('https://example.com/ with two forwarded endpoints in one header', function (done) {
      server = http.createServer(trusted)
      server.listen(3000, function (error) {
        if (error) return done(error)
        request('http://localhost:3000/', {
          headers: {
            'forwarded': 'proto=https, host=example.com'
          }
        }, function (error, response, body) {
          if (error) return done(error)
          body.should.equal('https://example.com/')
          done()
        })
      })
    })
  })
})
