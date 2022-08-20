require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
morgan.token('body', (request) => {
  if (request.method === 'POST') return JSON.stringify(request.body)
  else return null
})

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!

const Person = require('./models/person')


app.get('/api/persons', (request, response) => {
  Person.find({}).then(item => response.json(item))
})

app.get('/info', (request, response) => {
  response.header({ Date: (new Date()).toUTCString() })
  const date = response.get('Date')
  Person.find({})
    .then(result => response.send(`<p>Phonebook has info for ${result.length} people.<br>${date}</p>`))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})
/*
const createNewId = () => {
    // Create an id as such persons.length <= id <= 1000
    const id = Math.floor((Math.random() * 1000) + persons.length)
    return id
}
*/
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  Person.find({})
    .then(result => {
      if (result.filter(item => item.name === body.name).length !== 0) {
        return response.status(400).json({ error: `${body.name} is already in the phonebook, the name must be unique.` })
      } else {
        newPerson.save()
          .then(savedItem => response.json(savedItem))
          .catch(error => next(error))
      }
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknowEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`The server is running on port ${PORT}`))
