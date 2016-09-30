/* eslint-env mocha */

var http = require('http')
var request = require('request')
var locat = require('./')

var middleware = function (request, response) {
  return response.end(locat(request))
}

describe('Without proxy', function () {
  var server

  afterEach(function (done) {
    server.close(done)
  })

  it('http://localhost:3000/', function (done) {
    server = http.createServer(middleware)
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
    server = http.createServer(middleware)
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
    server = http.createServer(middleware)
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
