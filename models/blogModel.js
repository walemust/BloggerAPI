const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: String,
  },
  state: {
    type: String,
    default: "draft",
    enum: ["draft", "published"],
  },
  readCount: {
    type: Number,
    default: 0,
  },
  readingTime: Number,
  tags: [String],
  body: String
},
  { timestamps: true }
);

// calculate the reading time before saving document
blogSchema.pre('save', function (next) {
  let article = this

  // calculate time in minutes
  const timeToRead = readingTime(this.body)

  article.reading_time = timeToRead
  next()
})

// calculate the reading time before updating document
blogSchema.pre('findOneAndUpdate', function (next) {
  let article = this._update

  // calculate the time in minutes
  if (article.body) {
    const timeNeededToRead = readingTime(article.body)
    article.reading_time = timeNeededToRead
  }

  next()
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
    delete returnedObject.owner
  },
})

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
