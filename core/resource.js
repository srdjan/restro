import Either from 'data.either'
import fn from './fn'
import db from './db'

function validateApiCall (ctx) {
  if (ctx.hal) {
    let links = ctx.entity.getLinks()
    if (fn.none(link => link.rel === ctx.rel, links)) {
      ctx.statusCode = 405
      ctx.result = { Error: 'Conflict - Method call not allowed' }
      return Either.Left(ctx)
    }
  }
  return Either.Right(ctx)
}

function validatePropsExist (ctx) {
  if (fn.propsDontExist(ctx.body, ctx.entity)) {
    ctx.statusCode = 400
    ctx.result = { Error: 'Bad Request - props do not exist' }
    return Either.Left(ctx)
  }
  return Either.Right(ctx)
}

function validatePropsMatch (ctx) {
  if (fn.propsDontMatch(ctx.body, ctx.entity)) {
    ctx.statusCode = 400
    ctx.result = { Error: 'Bad Request - props do not match' }
    return Either.Left(ctx)
  }
  return Either.Right(ctx)
}

function update (ctx) {
  fn.map(key => (ctx.entity[key] = ctx.body[key]), Object.keys(ctx.body))
  return Either.Right(ctx)
}

function persist (ctx) {
  if (ctx.method === 'put' || ctx.method === 'patch') {
    ctx.result = db.save(ctx.entity)
  } else if (ctx.method === 'delete') {
    let result = db.remove(ctx.id)
    if (result) {
      ctx = getAll(ctx)
    } else {
      ctx.statusCode = 500
      ctx.result = { Error: ' not able to Delete' }
    }
  } else if (ctx.method === 'post') {
    // if (ctx.id) {
    //   ctx.result = db.save(ctx.entity)
    // }
    // else {
    ctx.result = db.add(ctx.entity)
    // }
  } else {
    ctx.statusCode = 405
    ctx.result = { Error: 'Method Not Allowed' }
    return Either.Left(ctx)
  }
  return Either.Right(ctx)
}

function processApi (ctx) {
  if (!ctx.hal) {
    return Either.Right(ctx)
  }

  if (ctx.entity[ctx.rel](ctx.body)) {
    return Either.Right(ctx)
  }
  fn.log('domain API returned false - no changes to entity should persist')
  return Either.Left(ctx)
}

function getAll (ctx) {
  let all = db.getAll(ctx.pageNumber)
  ctx.result = all.page
  ctx.pageNumber = all.pageNumber
  ctx.pageCount = all.pageCount
  return ctx
}

function get(ctx) {
  if (ctx.id) {
    let entity = db.get(ctx.id)
    if (typeof entity === 'undefined') {
      ctx.statusCode = 404
      ctx.message = 'Not Found'
    } else {
      ctx.result = entity
    }
  } else {
    ctx = getAll(ctx)
  }
  return ctx
}
function post(ctx) {
  if (ctx.id) {
    ctx.entity = db.get(ctx.id)
    return validateApiCall(ctx).chain(processApi).chain(persist).merge()
  }
  ctx.entity = new ctx.typeCtor()
  return validatePropsMatch(ctx).chain(update).chain(persist).merge()
}

function put(ctx) {
  ctx.entity = db.get(ctx.id)
  return validatePropsMatch(ctx)
    .chain(validateApiCall)
    .chain(processApi)
    .chain(update)
    .chain(persist)
    .merge()
}

function patch(ctx) {
  ctx.entity = db.get(ctx.id)
  return validatePropsExist(ctx)
    .chain(validateApiCall)
    .chain(processApi)
    .chain(update)
    .chain(persist)
    .merge()
}

function del(ctx) {
  ctx.entity = db.get(ctx.id)
  return validateApiCall(ctx).chain(processApi).chain(persist).merge()
}

export default {
  get,
  post,
  put,
  patch,
  del
}