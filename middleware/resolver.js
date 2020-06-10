import fn from '../core'

function resolver(model) {
  return {
    func: function (ctx) {
      let tokens = fn.getTokens(ctx.url)
      if (tokens.length < 2) {
        ctx.result = { Error: 'type resolver error' }
        ctx.statusCode = 500
        return ctx
      }

      let typeName = tokens[1].slice(0, -1)
      ctx.typeName = typeName.charAt(0).toUpperCase() + typeName.substring(1)
      ctx.typeCtor = model[ctx.typeName]

      if (!ctx.hal) {
        if (tokens.length === 3) {
          let id = Number(tokens[2])
          if (!isNaN(id)) {
            ctx.id = id // todo: convert to number?
          }
        }
      }
      return ctx
    }
  }
}

export default resolver