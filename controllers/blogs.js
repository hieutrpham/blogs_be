const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    
    console.log('AUTH', authorization)

    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

blogRouter.get('/', async (request, response) => {
    const blog = await Blog.find({}).populate('userId', {username: 1, name: 1})
    response.json(blog)
})

blogRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    console.log('Token decoded', decodedToken)
    
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

    console.log(savedBlog)
    
    user.blog = user.blog.concat(savedBlog._id)

    await user.save()
  
    const blogs = await Blog.findById(savedBlog._id).populate('userId', {username: 1, name: 1})

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