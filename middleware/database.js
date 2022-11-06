const mongoose = require('mongoose')
const { MONGO_URI } = require("../access/access")

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