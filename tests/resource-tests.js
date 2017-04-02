"use strict"

const resource = require('../middleware/resource')
const db = require('../core').db
const log = m => console.log(`resource test: ${m}`)
const expect = require('expect.js')

db.clear()

//---------------------------------------------------------------------------------
// simple resource tests
let SimpleApple = _ => ({
  weight: 1,
  color: 'green'
})

//test_create_simple_resource_collection() {
let simpleApple = SimpleApple()
let ctx = {
  id: 0,
  rel: "self",
  method: "post",
  typeCtor: SimpleApple,
  body: simpleApple,
  entity: simpleApple
}

ctx = resource.post(ctx)
log(ctx.result)
expect(ctx.result.color).to.be('green')

//test_get_simple_resource_collection() {
ctx = {
  pageNumber: 1
}

let result = resource.get(ctx)
log(result)
expect(result.length).to.be(1)

//---------------------------------------------------------------------------------
// resource with states tests
db.clear()

// test post, id = 0
//test_post() {
ctx = {
  id: 0,
  typeCtor: _ => { this.name = 'sam' },
  body: { name: 'sam' }
}
result = resource.post(ctx)
expect(result.body.name).to.be.equal(result.entity.name)

//test_post2() {
ctx = {
  id: 0,
  typeCtor: _ => { this.name = 'sam1' },
  body: { nammmme: 'sam' }
}
result = resource.post(ctx)
expect(result.statusCode).to.be(400)

// test post, id != 0,  prepare db:
// test_post3() {
ctx = {
  id: 0,
  typeCtor: _ => { this.name = '' },
  body: { name: 'sam' },
  entity: {
    name: '???',
    getLinks: function () {
      return [{ rel: 'grow', method: "POST" },
      { rel: 'toss', method: "DELETE" }]
    }
  }
}
let fromDb = db.add(ctx.entity)
ctx.id = fromDb.id
result = resource.post(ctx)
expect(result.statusCode).to.be(405)

// test_post4() {
ctx = {
  id: 0,
  typeCtor: _ => { this.name = '' },
  body: { nammmme: 'sam' },
  entity: { name: '' }
}
result = resource.post(ctx)
expect(result.statusCode).to.be(400)

// test delete:
let Apple = function () {
  this.weight = 1
  this.color = 'green'

  this.grow = function (msg) {
    if (this.weight > 0 && (this.weight + msg.weightIncr) < 300) {
      this.weight += msg.weightIncr
      return true
    }
    return false
  }

  this.eat = function (msg) {
    if (msg.weight) return false
    return true
  }

  this.toss = function (msg) {
    log('tossed apple: ' + JSON.stringify(this))
    return true
  }

  this.getLinks = function () {
    if (this.weight > 0 && this.weight < 200) {
      return [{ rel: 'grow', method: "POST" },
      { rel: 'toss', method: "DELETE" }]
    }
    else if (this.weight >= 200 && this.weight < 300) {
      return [{ rel: 'eat', method: "PUT" },
      { rel: 'toss', method: "DELETE" }]
    }
    else if (!this.weight) {
      return [{ rel: 'toss', method: "DELETE" }]
    }
    return []
  }
}

let apple = new Apple()
ctx = {
  id: 0,
  rel: "create",
  method: "post",
  typeCtor: Apple,
  body: apple,
  entity: apple
}

fromDb = resource.post(ctx)
ctx.id = fromDb.entity.id

ctx.rel = "toss"
ctx.method = "delete"
resource.delete(ctx)

ctx.rel = "self"
ctx.method = "get"
fromDb = resource.get(ctx)
expect(fromDb.statusCode).to.be(404)

db.clear()
