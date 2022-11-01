const mongoose = require('mongoose')

module.exports = (URI) => {
    mongoose
        .connect(URI)
        .then(() => {
            console.log('Connected to MongoDB successfully')
        })
        .catch((err) => {
            console.log('Connection to MongoDB failed', err.message)
        })
}