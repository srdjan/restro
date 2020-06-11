const expect = require('expect.js')
import URLSafeBase64 from 'urlsafe-base64'
import Either from 'data.either'
import {compose, contains, filter, none, every, difference, map, chain} from 'ramda'

const log = console.log
function trace(obj) {
  log(obj)
  log(new Error().stack)
}

function trimLeftAndRight(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "")
}

function atob(str) {
  let buf = new Buffer(str, 'ascii')
  let res = URLSafeBase64.encode(buf)
  return res
}

function btoa(str) {
  let res = URLSafeBase64.decode(str).toString()
  return res
}

function propsMatch(obj1, obj2) {
  if (! obj1 || ! obj2) return false
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length === 0
}

function propsDontMatch(obj1, obj2) {
  return !exports.propsMatch(obj1, obj2)
}

function propsExist(obj1, obj2) {
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length > 0
}

function propsDontExist(obj1, obj2) {
  return !exports.propsExist(obj1, obj2)
}

function getFnName(func) {
  let isFunc = typeof func == 'function'
  let s = isFunc && ((func.name && ['', func.name]) || func.toString().match(/function ([^\(]+)/))
  return (!isFunc && 'not a function') || (s && s[1] || 'anonymous')
}

function getTokens(url) {
  let path = url.substring(url.indexOf('api'), url.length)
  return trimLeftAndRight(path, '/').split('/')
}

function isApiCall(request) { return request.url.indexOf('/api') !== -1 }
function hasBody(method) { return method === 'POST' || method === 'PUT' || method === 'PATCH' }

function trace(h, func, ctx) {
  log(h + exports.getFnName(func) + ', ' + JSON.stringify(ctx))
}

// f, ep, m(a) -> m(b)
function run(middleware, ep, m) {
  return m.chain(d => {
    if (middleware.trace) trace('-> ', middleware.func, d)
    let r = middleware.func(d)
    if (middleware.trace) trace('<- ', middleware.func, r)

    var res = ep(r) ? Either.Left(r) : Either.Right(r)
    return res
  })
}

// hs, ep, a -> b | err
function runAll(pipeline, ep, ctx) {
  let mctx = Either.of(ctx)
  pipeline.forEach(middleware => { mctx = run(middleware, ep, mctx) })
  return mctx.merge()
}

export default {
  compose,
  contains,
  filter,
  none,
  every,
  difference,
  map,
  chain,
  trace,
  log,
  trimLeftAndRight,
  atob,
  btoa,
  propsMatch,
  propsDontMatch,
  propsExist,
  propsDontExist,
  getTokens,
  isApiCall,
  hasBody,
  getFnName,
  runAll
}
