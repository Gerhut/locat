var Buffer = require('buffer').Buffer
var querystring = require('querystring')
var url = require('url')

module.exports = function (request, trustProxy) {
  if (typeof trustProxy === 'undefined') {
    trustProxy = true
  } else {
    trustProxy = !!trustProxy
  }

  return getOrigin(request, trustProxy) + getPathname(request, trustProxy)
}

function getOrigin (request, trustProxy) {
  var forwarded = null
  if (trustProxy && request.headers['forwarded'] != null) {
    forwarded = parseForwarded(request.headers['forwarded'])
  }
  return url.format({
    protocol: getProtool(request, trustProxy, forwarded),
    auth: getAuth(request),
    host: getHost(request, trustProxy, forwarded)
  })
}

function getProtool (request, trustProxy, forwarded) {
  if (request.socket.encrypted) {
    return 'https'
  }
  if (forwarded && forwarded.proto) {
    return forwarded.proto
  }
  if (trustProxy) {
    var value
    if (request.headers['x-forwarded-proto'] != null) {
      value = request.headers['x-forwarded-proto'].split(',')[0].trim()
      if (value === 'https') {
        return 'https'
      }
    } else if (request.headers['front-end-https'] != null) {
      if (request.headers['front-end-https'] === 'on') {
        return 'https'
      }
    } else if (request.headers['x-forwarded-ssl'] != null) {
      if (request.headers['x-forwarded-ssl'] === 'on') {
        return 'https'
      }
    } else if (request.headers['x-url-scheme'] != null) {
      if (request.headers['x-url-scheme'] === 'https') {
        return 'https'
      }
    }
  }
  return 'http'
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

function getHost (request, trustProxy, forwarded) {
  if (forwarded && forwarded.host) {
    return forwarded.host
  }
  if (trustProxy && request.headers['x-forwarded-host'] != null) {
    return request.headers['x-forwarded-host']
  }
  return request.headers['host'] || null
}

function getPathname (request) {
  if ('originalUrl' in request) {
    return request.originalUrl
  }
  return request.url
}

function parseForwarded (forwardedValues) {
  if (Array.isArray(forwardedValues)) {
    forwardedValues = forwardedValues.join(',')
  }
  forwardedValues = forwardedValues.split(',')
  var forwarded = {}
  for (var i = 0, l = forwardedValues.length; i < l; i++) {
    var f = querystring.parse(forwardedValues[i].trim(), ';')
    if (forwarded.proto == null && f.proto != null) {
      forwarded.proto = f.proto
    }
    if (forwarded.host == null && f.host != null) {
      forwarded.host = f.host
    }
    if (forwarded.proto != null && forwarded.host != null) {
      break
    }
  }
  return forwarded
}

function decodeBase64 (string) {
  if (typeof Buffer.from === 'function') {
    return Buffer.from(string, 'base64').toString()
  } else {
    return new Buffer(string, 'base64').toString()
  }
}
