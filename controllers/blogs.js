const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

blogRouter.get('/', async (request, response) => {
    const blog = await Blog.find({}).populate('userId', {username: 1, name: 1})
    response.json(blog)
})

blogRouter.post('/', async (request, response) => {
    const body = request.body

    const newBlog = new Blog({
        "title": body.title,
        "author": body.author,
        "url": body.url,
        "likes": body.likes,
        "userId": body.userId
    })

    const savedBlog = await newBlog.save()

    const user = await User.findById(body.userId)  

    user.blog = user.blog.concat(savedBlog._id)

    await user.save()
  
    const blogs = await Blog.findById(savedBlog._id).populate('user', {username: 1, name: 1})

    response.status(401).json(blogs)
})

blogRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {

    const body = request.body

    const newBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }
    updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, {new: true})
    response.json(updatedBlog)
})

module.exports = blogRouter