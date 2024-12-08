const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => { 
    const blog = await Blog.find({}).populate('userId', {username: 1, name: 1})
    response.json(blog)
})

blogRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
    if (!decodedToken.id) {
        return response.status(401).json({error: 'token invalid'})
    }

    const user = await User.findById(decodedToken.id)
    
    const newBlog = new Blog({
        "title": body.title,
        "author": body.author,
        "url": body.url,
        "likes": body.likes,
        "userId": decodedToken.id
    })

    const savedBlog = await newBlog.save()
    
    user.blog = user.blog.concat(savedBlog._id)

    await user.save()
  
    const blogs = await Blog.findById(savedBlog._id).populate('userId', {username: 1, name: 1})

    response.status(401).json(blogs)
})

blogRouter.delete('/:id', async (request, response) => {

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({error: 'token invalid'})
    }

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(401).json({error: 'blog no longer exist'})
    }

    if (blog.userId.toString() === decodedToken.id) {
        console.log('same userid')
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } else {response.status(401).json({error: 'invalid username'})}
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