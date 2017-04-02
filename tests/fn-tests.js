"use strict"
const fn = require('../core/fn')
let expect = require('expect.js')
const log = m => console.log(`fn test: ${m}`)

expect(fn.propsMatch({name: "tom"}, {name: "tom"})).to.be(true)
expect(fn.propsDontMatch({name: "tom"}, {name1: "tom"})).to.be(true)

function f1(ctx) {
  if (ctx.counter > 1) {
    ctx.statusCode = 500
    return ctx
  }
  ctx.counter += 1
  return ctx
}
function f2(ctx) {
  if (ctx.counter > 1) {
    ctx.statusCode = 500
    return ctx
  }
  ctx.counter += 1
  return ctx
}
function f3(ctx) {
  if (ctx.counter > 1) {
    ctx.statusCode = 500
    return ctx
  }
  ctx.counter += 1
  return ctx
}

// setup
let pipeline = []
pipeline.push({ func: f1, pred: false, trace: false })
pipeline.push({ func: f2, pred: false, trace: false })
pipeline.push({ func: f3, pred: false, trace: false })

// run until failure
let ctx = { counter: 1, statusCode: 200 }
ctx = fn.runAll(pipeline, d => d.statusCode !== 200, ctx)
expect(ctx.counter).to.be(2)
expect(ctx.statusCode).to.be(500)
