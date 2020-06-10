'use strict'

let resolver = require('../middleware/resolver')({ Apple: function () {} })
let expect = require('expect.js')

log('testing: resolver.js')
// test: resolveType(url):- api/apples/123456/create
let url = '/api/apples/'
let ctx = resolver.func({ hal: false, url: url })
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob('123456')
ctx = resolver.func({ hal: false, url: url, model: { Apple: function () {} } })
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/'
ctx = exports.func({ hal: false, url: url, model: { Apple: function () {} } })
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob('123456')
ctx = resolver.func({ hal: false, url: url, model: { Apple: function () {} } })
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob(123456 + '/' + 'create')
ctx = resolver.func({ hal: false, url: url, model: { Apple: function () {} } })
expect(ctx.typeName).to.be('Apple')

// should fail
url = 'apples' + fn.atob(123456 + '/' + 'create')
ctx = resolver.func({ hal: false, url: url, model: { Apple: function () {} } })
expect(ctx.statusCode).to.be(500)
