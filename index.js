const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', (request, response) => {
    if (request.method === 'POST') return JSON.stringify(request.body)
    else return null
}) 


app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
     }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const len = persons.length
    response.header({Date: (new Date()).toUTCString()})
    const date = response.get('Date')
    response.send(
        `<p>Phonebook has info for ${len} people.<br>${date}</p>`
    )
    
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const createNewId = () => {
    // Create an id as such persons.length <= id <= 1000
    const id = Math.floor((Math.random() * 1000) + persons.length)
    return id
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const filter = persons.filter(person => person.id === body.name)

    if (!body.name || !body.number) {
        return response.status(400).json({error: 'name or number missing'})
    } else if (filter.length !== 0) {
        return response.status(400).json({error: `${body.name} is already in the phonebook, the name must be unique.`})
    }

    const newPerson = {
        id: createNewId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`The server is running on port ${PORT}`))
