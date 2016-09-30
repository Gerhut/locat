var Buffer = require('buffer').Buffer
var url = require('url')

module.exports = function (request, trustProxy) {
  if (typeof trustProxy === 'undefined') {
    trustProxy = true
  } else {
    trustProxy = !!trustProxy
  }

  return url.format({
    protocol: getProtool(request, trustProxy),
    auth: getAuth(request),
    host: getHost(request, trustProxy)
  }) + getPathname(request, trustProxy) // Prevent auto encoding
}

function getProtool (request, trustProxy) {
  if (request.socket.encrypted) {
    return 'https'
  } else {
    return 'http'
  }
}

function getAuth (request) {
  var authHeader = request.headers['authorization']
  if (authHeader == null) return
  var authParts = authHeader.match(/^(.+?)\s(.+)$/)
  if (authParts == null) return
  if (authParts[1] === 'Basic') {
    return decodeBase64(authParts[2])
  }
}

function getHost (request) {
  return request.headers['host']
}

function getPathname (request) {
  return request.url
}

function decodeBase64 (string) {
  if (typeof Buffer.from === 'function') {
    return Buffer.from(string, 'base64').toString()
  } else {
    return new Buffer(string, 'base64').toString()
  }
}
