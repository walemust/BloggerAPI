const router = require("express").Router();
const blogControl = require("../controllers/blogs");
const { filterAndSort, filterByPublished, list, setUserFilter } = require('../middleware/apiPoints')
const getBearerToken = require("../middleware/bearerToken");
const { getUserFromToken, assignUser } = require("../middleware/validateUser");
const pagination = require("../middleware/pagination");
const creator = require('../middleware/creator')

router.route('/').get(filterAndSort, filterByPublished, list, pagination, blogControl.getListOfPublishedBlogs)
    .post(getUserFromToken, blogControl.createBlog)

router.route("/g").get(getUserFromToken, filterAndSort, setUserFilter, pagination, blogControl.getListOfPublishedBlogs)

router.route('/:id').get(assignUser, blogControl.getPublishedBlog)
    .patch(getUserFromToken, creator, blogControl.updatePublishedBlogState)
    .put(getUserFromToken, creator, blogControl.updatePublishedBlog)
    .delete(getUserFromToken, creator, blogControl.deletePublishedBlog)


module.exports = router;
