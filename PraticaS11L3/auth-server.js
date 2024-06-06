const jsonServer = require('json-server')
const auth = require('json-server-auth')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

const rules = auth.rewriter({
  "/users*": "/600/users$1"
})

// Bind the router db to the app
server.db = router.db

server.use(middlewares)
server.use(rules)
server.use(auth)
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
