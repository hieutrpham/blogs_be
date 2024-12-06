const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')

blogRouter.get('/', async (request, response) => {
    const blog = await Blog.find({})
    response.json(blog)
})

blogRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)

    blog.save().then(result => {
        response.status(201).json(result)
    })
    .catch(err => console.log('error posting blog',err.message))
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