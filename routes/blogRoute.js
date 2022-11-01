const router = require("express").Router();
const { createBlog, getListOfPublishedBlogs, getPublishedBlog } = require("../controllers/blogs");
const getBearerToken = require("../middleware/bearerToken");
const getUserFromToken = require("../middleware/userFromToken");

router.route('/').get(getListOfPublishedBlogs)
router.route('/:id').get(getPublishedBlog)

// allow only requests with valid tokens
router.use(getBearerToken, getUserFromToken);
router.route("/").post(createBlog);

module.exports = router;
