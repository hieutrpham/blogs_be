const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')

blogRouter.get('/', (request, response) => {
    Blog.find({}).then(blog => response.json(blog))
})

blogRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)

    blog.save().then(result => {
        response.status(201).json(result)
    })
    .catch(err => console.log('error posting blog',err.message))
})

module.exports = blogRouter