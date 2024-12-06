const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const helper = require('./test_helper')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany()
    const blogObj = helper.initBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObj.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are return as json', async () => {
    await api.get('/api/blogs')
        .expect(200)
        .expect('content-type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initBlogs.length)
})

test('id format is correct', async () => {
    const response = await api.get('/api/blogs')
    const idName = response.body.map(blog => Object.keys(blog)[4])
    const uniqueID = [...new Set(idName)]
    assert.deepStrictEqual(uniqueID, ['id'])
})

test('post requests work', async () => {
    const newBlog = {
        title: "test",
        author: "test",
        url: "www.test.com",
        likes: 2
    }
    
    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('content-type', /application\/json/)

    const totalBlogs = await helper.blogsInDB()
    assert.strictEqual(totalBlogs.length, helper.initBlogs.length + 1)

    const content = totalBlogs.map(n => n.title)
    assert(content.includes('test'))
})

test('blog can be deleted', async () => {
    const id = helper.initBlogs[0]._id
    await api.delete(`/api/blogs/${id}`)
        .expect(204)
    
    const currentBlogs = await helper.blogsInDB()
    
    assert.deepEqual(currentBlogs.length, helper.initBlogs.length - 1)
})

test('blog can be updated', async () => {
    const startBlogs = await helper.blogsInDB()

    const blogToCheck = startBlogs[0]    

    const newBlog = {
        title: "test",
        author: "test",
        url: "www.test.com",
        likes: 2,
        id: blogToCheck.id
    }

    const updatedBlog = await api.put(`/api/blogs/${blogToCheck.id}`)
        .send(newBlog)

    console.log(updatedBlog.body)
    
        
    assert.deepStrictEqual(updatedBlog.body, newBlog)
})

after(async () => {
    await mongoose.connection.close()
})