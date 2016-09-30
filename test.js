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

  it('http://localhost/', function (done) {
    server = http.createServer(middleware)
    server.listen(80, function (error) {
      if (error) return done(error)
      request('http://localhost/', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost/')
        done()
      })
    })
  })

  it('http://localhost:8080/', function (done) {
    server = http.createServer(middleware)
    server.listen(8080, function (error) {
      if (error) return done(error)
      request('http://localhost:8080/', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost:8080/')
        done()
      })
    })
  })

  it('http://foo:bar@localhost/', function (done) {
    server = http.createServer(middleware)
    server.listen(80, function (error) {
      if (error) return done(error)
      request('http://foo:bar@localhost/', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://foo:bar@localhost/')
        done()
      })
    })
  })

  it('http://localhost/foo?bar', function (done) {
    server = http.createServer(middleware)
    server.listen(80, function (error) {
      if (error) return done(error)
      request('http://localhost/foo?bar', function (error, response, body) {
        if (error) return done(error)
        body.should.equal('http://localhost/foo?bar')
        done()
      })
    })
  })
})
