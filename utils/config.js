require('dotenv').config({path: './.env', debug: true})

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI

module.exports = {
    PORT,
    MONGODB_URI
}