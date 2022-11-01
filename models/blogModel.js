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
  body: [String]
},
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
