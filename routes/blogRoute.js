const router = require("express").Router();
const { createBlog, getListOfPublishedBlogs, getPublishedBlog, updatePublishedBlog,
    deletePublishedBlog,
    updatePublishedBlogState } = require("../controllers/blogs");
const { filterAndSort, filterByPublished, list, setUserFilter } = require('../middleware/apiPoints')
const getBearerToken = require("../middleware/bearerToken");
const { getUserFromToken, assignUser } = require("../middleware/validateUser");
const pagination = require("../middleware/pagination");
const creator = require('../middleware/creator')

router.route('/').get(filterAndSort, filterByPublished, list, pagination, getListOfPublishedBlogs)
    .post(getUserFromToken, createBlog)

router.route("/g").get(getUserFromToken, filterAndSort, setUserFilter, pagination, getListOfPublishedBlogs)

router.route('/:id').get(assignUser, getPublishedBlog)
    .patch(getUserFromToken, creator, updatePublishedBlogState)
    .put(getUserFromToken, creator, updatePublishedBlog)
    .delete(getUserFromToken, creator, deletePublishedBlog)


module.exports = router;
