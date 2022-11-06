const mongoose = require('mongoose')

module.exports = (MONGO_URI) => {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB successfully')
        })
        .catch((err) => {
            console.log('Connection to MongoDB failed', err.message)
        })
}