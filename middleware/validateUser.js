const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const getUserFromToken = async (req, res, next) => {
    try {
        // get the bearer token from header
        const authorization = req.get('authorization')
        if (!(authorization && authorization.toLowerCase().startsWith('bearer'))) {
            throw new Error()
        }
        const bearerToken = authorization.substring(7)

        // decode the bearer token
        const userFromToken = jwt.verify(bearerToken, process.env.SECRET)
        const user = await User.findById(userFromToken.id)
        if (!user) {
            throw new Error()
        }

        // add the user to request object
        req.user = user
        next()
    } catch (err) {
        err.source = 'jwt middleware error'
        next(err)
    }
}

const assignUser = async (req, res, next) => {
    try {
        // get bearer token from header
        const authorization = req.get('authorization')
        if (!(authorization && authorization.toLowerCase().startsWith('bearer'))) {
            return next()
        }
        const bearerToken = authorization.substring(7)

        // decode bearer token
        const userFromToken = jwt.verify(bearerToken, process.env.SECRET)
        const user = await User.findById(userFromToken.id)
        if (!user) {
            return next()
        }

        // add user to request object
        req.user = user
        next()
    } catch (err) {
        // if no token, or token expired, next
        next()
    }
}

module.exports = {
    getUserFromToken,
    assignUser,
}