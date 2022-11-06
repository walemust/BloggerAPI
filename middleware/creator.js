module.exports = async (req, res, next) => {
    try {
        const userArticles = req.user.articles.map(id => id.toString())
        const { id } = req.params
        const present = userArticles.includes(id)

        if (!present) {
            return res.status(403).json({
                status: 'failed',
                error: 'Forbidden'
            })
        }

        next()
    } catch (err) {
        err.source = 'jwt middleware error'
        next(err)
    }
}