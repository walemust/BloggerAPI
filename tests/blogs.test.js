const mongoose = require("mongoose");
const app = require("../index");
const supertest = require("supertest");
const api = supertest(app);
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const check = require("./test_check");

let token;

const login = async (username) => {
  const response = await api.post("/api/login").send({
    username,
    password: "Password0!",
  });

  token = response.body;
};

beforeAll(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const users = check.initialUsers();
  for (let i = 0; i < users.length; i++) {
    await User.create(users[i]);
  }

  const blogs = check.initialArticles();
  for (let i = 0; i < 100; i++) {
    await Blog.create(blogs[i]);
  }
});

describe("Creating a blog", () => {
  it("should work with valid token", async () => {
    const user = "user3";
    await login(user);

    const blogsBefore = await check.articlesInDb();

    const response = await api
      .post("/api/blog")
      .set("Authorization", `Bearer ${token.token}`)
      .send(check.articleObject(`Article by ${user}`))
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.data).toHaveProperty("title");
    expect(response.body.data).toHaveProperty("description");
    expect(response.body.data).toHaveProperty("tags");
    expect(response.body.data).toHaveProperty("author");
    expect(response.body.data).toHaveProperty("createdAt");
    expect(response.body.data).toHaveProperty("updatedAt");
    expect(response.body.data).toHaveProperty("read_count");
    expect(response.body.data).toHaveProperty("reading_time");
    expect(response.body.data).toHaveProperty("body");
    expect(response.body.data).toHaveProperty("state");
    expect(response.body.data.state).toBe("draft");

    const blogsAfter = await check.articlesInDb();
    expect(blogsBefore.length).toBe(blogsAfter.length - 1);
  });

  it("should return an error if no valid tokens are provided", async () => {
    const blogsBefore = await check.articlesInDb();
    const response = await api
      .post("/api/blog")
      .send(check.articleObject("Article by no registered user"))
      .expect(403);

    expect(response.body.status).toBe('failed');

    const blogsAfter = await check.articlesInDb();
    expect(blogsBefore.length).toBe(blogsAfter.length);
  });

  it('should return an error if an invalid detail is supplied', async () => {
    const user = 'user4'
    await login(user)
    const faultyArticle = check.articleObject()
    const blogsBefore = await check.articlesInDb()

    const response = await api
      .post('/api/blog')
      .set('Authorization', `Bearer ${token.token}`)
      .send(faultyArticle)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.status).toBe('failed')
    expect(response.body).toHaveProperty('error')

    const blogsAfter = await check.articlesInDb()
    expect(blogsBefore.length).toBe(blogsAfter.length)
  })
});


describe("GET request to /api/blog", () => {
  it("when not logged in they should be able to get a list of published blogs", async () => {
    const response = await api
      .get("/api/blog")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogStates = response.body.data.map((blog) => blog.state);
    expect(blogStates).not.toContain("draft");
    expect(response.body.data[0]).not.toHaveProperty("body");
  });

  it("when logged in should be able to get a list of published blogs", async () => {
    const user = "user1";
    await login(user);

    const response = await api
      .get("/api/blog")
      .set("Authorization", `Bearer ${token.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogStates = response.body.data.map((blog) => blog.state);
    expect(blogStates).not.toContain("draft");
    expect(response.body.data[0]).not.toHaveProperty("body");
  });

  it("when requested by ID should be able to get a published blog", async () => {
    const articlesAtStart = await check.articlesInDb();

    const articleToView = articlesAtStart[0];

    const resultArticle = await api
      .get(`/api/blog/${articleToView._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedArticleToView = JSON.parse(JSON.stringify(articleToView));

    expect(resultArticle.body.data.title).toEqual(processedArticleToView.title);
    expect(resultArticle.body.data.body).toEqual(processedArticleToView.body);
    expect(resultArticle.body.data.tags).toEqual(processedArticleToView.tags);
    expect(resultArticle.body.data._id).toEqual(processedArticleToView._id);
  });

  it("when requested by ID should return the author information", async () => {
    const articlesAtStart = await check.articlesInDb();
    const users = await check.usersInDb();
    const user1 = users[0];

    const articleToView = articlesAtStart[0];

    const resultArticle = await api
      .get(`/api/blog/${articleToView._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const authorOfArticle = resultArticle.body.data.author;
    expect(authorOfArticle.username).toBe(user1.username);
    expect(authorOfArticle.id).toBe(user1.id);
  });

  it("when requested by ID should increase the read_count by 1", async () => {
    const articlesAtStart = await check.articlesInDb();

    const articleToView = articlesAtStart[0];

    await api
      .get(`/api/blog/${articleToView._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const articlesAtMid = await check.articlesInDb();
    const articleViewedAtMid = articlesAtMid[0];

    expect(articleViewedAtMid.read_count).toBe(articleToView.read_count + 1);

    await api
      .get(`/api/blog/${articleToView._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const articlesAtEnd = await check.articlesInDb();
    const articleViewed = articlesAtEnd[0];

    expect(articleViewed.read_count).toBe(articleToView.read_count + 2);
  });

  it("returns a max of 20 blogs per page", async () => {
    const response = await api
      .get("/api/blog")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.data.length).toBe(20);
  });

  it("returns x blogs per page and a max of 20 blogs per page", async () => {
    let size = 9;
    const response = await api
      .get(`/api/blog?size=${size}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.data.length).toBe(size);

    size = 90;
    const response2 = await api
      .get(`/api/blog?size=${size}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response2.body.data.length).toBe(20);
  });

  it('returns blogs by a specific author', async () => {
    let author = 'user1'
    const response = await api
      .get(`${url}?author=${author}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const authorArray = response.body.data.map((blog) => blog.author.username)
    for (const blogAuthor of authorArray) {
      expect(blogAuthor).toBe(author)
    }

    author = 'user4'
    const response2 = await api
      .get(`${url}?author=${author}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const author2Array = response2.body.data.map((blog) => blog.author.username)
    for (const blogAuthor of author2Array) {
      expect(blogAuthor).toBe(author)
    }
  })

  it('returns a blog with a specific title', async () => {
    let title = 'at nam consequatur ea labore ea harum'
    const response = await api
      .get(`${url}?title=${title}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.data[0]._id).toBe('635f9d229a39346186b332cf')
    expect(response.body.data[0].title).toBe(title)
  })
})

/**
 * Owner of the blog should be able to get a list of their blogs.
 * Endpoint should be paginated
 * It should be filterable by state
 */
describe('The owner of the blog', () => {
  const URL = '/api/blog'
  it('should be able to get a list of their blogs', async () => {
    const user = 'user1'
    await login(user)

    const response = await api
      .get(`${URL}/p`)
      .set('Authorization', `Bearer ${token.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const authorArray = response.body.data.map((blog) => blog.author.username)
    for (const author of authorArray) {
      expect(author.toLowerCase()).toBe(user.toLowerCase())
    }
  })

  it('should be able to get a list of their published blogs', async () => {
    const response = await api
      .get(`${URL}/p?state=published`)
      .set('Authorization', `Bearer ${token.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const statesArray = response.body.data.map((blog) => blog.state)
    expect(statesArray).not.toContain('draft')
  })

  it('should be able to get a list of their blogs in draft state', async () => {
    const response = await api
      .get(`${URL}/p?state=draft`)
      .set('Authorization', `Bearer ${token.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const statesArray = response.body.data.map((blog) => blog.state)
    expect(statesArray).not.toContain('published')
  })

  /**
   * Owner of the blog should be able to update the state of the
   * blog to published
   */
  it('should be able to update the state of the blog to published', async () => {
    // get article and it's author
    const articles = await check.articlesInDb()
    const draftArticles = articles.filter(article => article.state === 'draft')
    const articleToUpdate = check.getRandomArrayElement(draftArticles)
    const users = await check.usersInDb()
    const articleAuthor = users.find(user => user._id.toString() === articleToUpdate.author.toString()).username

    // login
    await login(articleAuthor)

    const articleId = articleToUpdate._id.toString()
    const response = await api
      .patch(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .send({ state: 'published' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.data.state).toBe('published')

    const updatedArticle = await api
      .get(`${URL}/${articleId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(updatedArticle.body.data.state).toBe('published')
  })

  /**
   * Owner of a blog should be able to edit the blog in draft or published state
   */
  it('should be able to edit the blog in draft or published state', async () => {
    const articles = await check.articlesInDb()
    const articleToUpdate = check.getRandomArrayElement(articles)
    const users = await check.usersInDb()
    const articleAuthor = users.find((user) => user._id.toString() === articleToUpdate.author.toString()).username

    // login
    await login(articleAuthor)

    const articleupdate = check.articleObject(`This article is updated by ${articleAuthor}`)

    const articleId = articleToUpdate._id.toString()
    const response = await api
      .put(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .send(articleupdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.data.state).toBe(articleToUpdate.state)
  })

  /**
   * Owner of the blog should be able to delete the blog in draft or published state
   */
  it('should be able to delete the blog in draft or published state', async () => {
    const articles = await check.articlesInDb()
    const articleToDelete = check.getRandomArrayElement(articles)
    const users = await check.usersInDb()
    const articleAuthor = users.find((user) => user._id.toString() === articleToDelete.author.toString()).username

    // login
    await login(articleAuthor)

    const articleId = articleToDelete._id.toString()
    const response = await api
      .delete(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.status).toBe('success')

    await api
      .get(`${URL}/${articleId}`)
      .expect(404)
  })
})

describe('Logged in users', () => {
  const URL = '/api/blog/'
  it('can not delete other users\' blogs', async () => {
    await login('user4')

    const articleId = '635eccc34dc4ea83291cf8de'
    await api
      .delete(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .expect(403)
      .expect('Content-Type', /application\/json/)
  })

  it('can not update the state of other users\' blogs', async () => {
    await login('user4')

    const articleId = '635eccc34dc4ea83291cf8de'
    await api
      .patch(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .send({ state: 'published' })
      .expect(403)
  })

  it('can not edit other users\' blogs in draft or published state', async () => {
    const user = 'user4'
    await login(user)
    const articleupdate = check.articleObject(`This article is updated by ${user}`)

    const articleId = '635eccc34dc4ea83291cf8de'
    await api
      .put(`${URL}/${articleId}`)
      .set('Authorization', `Bearer ${token.token}`)
      .send(articleupdate)
      .expect(403)
  })
});

afterAll(async () => {
  mongoose.connection.close();
});
