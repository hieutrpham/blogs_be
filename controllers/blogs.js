const blogRouter = require("express").Router();
const Blog = require("../models/blog.js");
const User = require("../models/user.js");
const middleware = require("../utils/middleware");

blogRouter.get("/", async (request, response) => {
  const blog = await Blog.find({}).populate("userId", { username: 1, name: 1 });
  response.json(blog);
});

blogRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;

  const user = await User.findById(request.user);

  const newBlog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    userId: request.user,
  });

  const savedBlog = await newBlog.save();

  user.blog = user.blog.concat(savedBlog._id);

  await user.save();

  const blogs = await Blog.findById(savedBlog._id).populate("userId", {
    username: 1,
    name: 1,
  });

  response.status(201).json(blogs);
});

blogRouter.post(
  "/:id/comments",
  middleware.userExtractor,
  async (request, response) => {
    const newComment = request.body.comments;
    console.log(newComment);

    const id = request.params.id;

    const blog = await Blog.findById(id);
    blog.comments = blog.comments.concat(newComment);
    console.log(blog);

    await blog.save();
    response.status(201).json(blog);
  }
);

blogRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const blog = await Blog.findById(request.params.id);

    const blogUserID = blog.userId ? blog.userId.toString() : 0;

    if (!blog) {
      return response.status(401).json({ error: "blog no longer exist" });
    }
    try {
      if (blogUserID === request.user) {
        await Blog.findByIdAndDelete(request.params.id);
        response.status(204).end();
      } else {
        response.status(401).json({ error: "invalid username" });
      }
    } catch (err) {
      console.log(err);
      response.json({ error: err });
    }
  }
);

blogRouter.post("/all", async (req, res) => {
  await Blog.deleteMany();
  return res.status(202);
});

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, {
    new: true,
  });
  response.json(updatedBlog);
});

module.exports = blogRouter;
