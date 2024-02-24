const dotenv = require('dotenv')
dotenv.config()


const server = require('./router/server')


const port = process.env.PORT || 9000

console.log(port)

server.listen(port, () => {
    console.log(`LIVE ON PORT: ${port || 9000}`)
})