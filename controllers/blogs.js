const Blog = require("../models/blogModel");
const { request } = require("..");

const createBlog = async (req, res, next) => {
  try {
    // grab details from the request
    const { title, description, tags, body } = req.body;
    // create blog object
    const newBlog = new Blog({
      title,
      description: description || title,
      tags,
      author: req.user._id,
      body,
      owner: req.user.username,
    });
    // save to database
    const createdBlog = await newBlog.save();

    // save blog ID to user document
    req.user.articles = req.user.articles.concat(createdBlog._id)
    await req.user.save()

    // return response
    return res.status(201).json({
      status: true,
      data: createdBlog,
    });
  } catch (e) {
    e.source = 'creating new blog'
    next(e);
  }
};

const getListOfPublishedBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog
      .find(req.findFilter)
      .sort(req.sort)
      .select(req.fields)
      .populate('author', { username: 1 })
      .skip(req.pagination.start)
      .limit(req.pagination.sizePerPage)

    const pageInfo = req.pageInfo
    // pageInfo.currentPage = req.pagination.page
    // if (req.pagination.previousPage) pageInfo.previousPage = req.pagination.previousPage
    // if (req.pagination.nextPage) pageInfo.nextPage = req.pagination.nextPage

    return res.json({
      status: true,
      pageInfo,
      data: blogs
    })
  } catch (err) {
    err.source = 'get published blogs controller'
    next(err)
  }
}

const getPublishedBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id)
      .populate('author', { username: 1 })

    if (!blog) {
      return res.status(404).json({
        status: 'failed',
        message: 'Blog not found'
      })
    }

    if (blog.state !== 'published') {
      return res.status(403).json({
        status: false,
        error: 'Requested article is not published'
      })
    }
    if (!request.user) {
      return response(res)
    } else if (blog.author._id.toString() !== req.user.id.toString()) {
      return response(res)
    }

    // update the blogs read count
    blog.read_count += 1
    await blog.save()

    return res.json({
      status: true,
      data: blog
    })
  } catch (err) {
    err.source = 'get published blog controller'
    next(err)
  }

  const updatePublishedBlogState = async (req, res, next) => {
    try {
      let { state } = req.body
      if (!(state && (state.toLowerCase() === 'published' || state.toLowerCase() === 'draft'))) {
        throw new Error('Please provide a valid state')
      }

      const blog = await Blog.findByIdAndUpdate(req.params.id, { state: state.toLowerCase() }, { new: true, runValidators: true, context: 'query' })

      if (!blog) {
        return res.status(404).json({
          status: 'failed',
          message: 'Blog not found'
        })
      }

      return res.json({
        status: 'ok',
        data: blog
      })
    } catch (err) {
      err.source = 'blog update failed'
      next(err)
    }
  }

  const updatePublishedBlog = async (req, res, next) => {
    try {
      let blogUpdate = { ...req.body }

      if (blogUpdate.state) delete blogUpdate.state

      const blog = await Blog.findByIdAndUpdate(req.params.id, blogUpdate, { new: true, runValidators: true, context: 'query' })

      if (!blog) {
        return res.status(404).json({
          status: 'failed',
          message: 'Blog not found'
        })
      }
      return res.json({
        status: 'ok',
        data: blog
      })
    } catch (err) {
      err.source = 'update blog'
      next(err)
    }
  }

  const deletePublishedBlog = async (req, res, next) => {
    const user = req.user
    try {
      const deletedBlog = await Blog.findByIdAndRemove(req.params.id)

      if (!deletedBlog) {
        return res.status(404).json({
          status: 'failed',
          error: 'Blog not found'
        })
      }
      const deletedBlogId = deletedBlog._id
      const index = user.articles.indexOf(deletedBlogId)
      user.articles.splice(index, 1)

      await user.save()

      res.json({
        status: 'success',
        data: deletedBlog
      })
    } catch (err) {
      next(err)
    }
  }

}

module.exports = {
  createBlog,
  getListOfPublishedBlogs,
  getPublishedBlog,
  updatePublishedBlog,
  deletePublishedBlog,
  updatePublishedBlogState,
};
