const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

userRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body

    if (password.length < 3) {
        response.status(400).json({error: 'invalid username or password'})
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User ({
        username, name, passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = userRouter