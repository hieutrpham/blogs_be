const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const { ConnectionPoolMonitoringEvent } = require('mongodb');

require('dotenv').config({ path: '.env', debug: true });

app.use(cors())
app.use(express.json())

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl)
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.log('error connecting to db', err.message)
    )



app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(err => console.log('error posting blog',err.message)
    )
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})