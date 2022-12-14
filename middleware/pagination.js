const Blog = require('../models/blogModel')

module.exports = async (req, res, next) => {
    try {
        req.pagination = {}

        let sizeFromQuery = parseInt(req.query.size)
        let pageFromQuery = parseInt(req.query.page)

        let size = 20,
            page = 1
        if (!isNaN(sizeFromQuery) && sizeFromQuery > 0 && sizeFromQuery < 21) size = sizeFromQuery

        let numberOfResults
        if (req.url.split('?')[0] === '/') {
            numberOfResults = await Blog.find({ state: 'published' }).countDocuments().exec()
        } else if (req.url.split('?')[0].length === 25) {
            numberOfResults = await Blog.find({ state: 'published' }).countDocuments().exec()
        }

        const totalPages = Math.ceil(numberOfResults / size)
        if (!isNaN(pageFromQuery) && pageFromQuery > 0 && pageFromQuery <= totalPages) page = pageFromQuery

        const start = (page - 1) * size
        const end = page * size
        if (start > 0) {
            req.pagination.previousPage = {
                page: page - 1,
                limit: size,
            }
        }
        if (end < numberOfResults) {
            req.pagination.nextPage = {
                page: page + 1,
                limit: size,
            }
        }

        req.pagination.page = page
        req.pagination.sizePerPage = size
        req.pagination.totalPages = totalPages
        req.pagination.start = (page - 1) * size
        req.pagination.end = page * size
        req.pagination.numberOfResults = numberOfResults

        req.pageInfo = { results: numberOfResults, totalPages }
        if (req.pagination.previousPage) req.pageInfo.previousPage = req.pagination.previousPage
        req.pageInfo.currentPage = req.pagination.page
        if (req.pagination.nextPage) req.pageInfo.nextPage = req.pagination.nextPage

        next()
    } catch (err) {
        err.source = 'pagination middleware'
        next(err)
    }
}