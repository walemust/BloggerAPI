const CONFIG = require('./config/config')
const express = require('express')
const errorHandler = require('./middleware/errorHandler')
const user = require('./routes/userRoute')
const login = require('./controllers/login')
const blog = require('./routes/blogRoute')

const app = express()

// connect to db
require('./middleware/database')(CONFIG.DBURI)

// parse information from request
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/user', user)
app.use('/api/login', login)
app.use('/api/blog', blog)

// use error handler middleware
app.use(errorHandler)

module.exports = app