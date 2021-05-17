require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const { response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('post-content', (req, res) => {
  const body = req.body

  if (body) {
    return JSON.stringify(body)
  }
})

app.use(morgan(':method :url :res[content-length] - :response-time ms :post-content'))

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(result => {
      res.send(`<div> Phonebook has info for ${result.length} people </div>
                <br>
                <div> ${new Date()} </div>`)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(result => {
      res.json(result)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(result => {
    res.json(result)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const newNumber = {
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, newNumber, { runValidators: true, new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})