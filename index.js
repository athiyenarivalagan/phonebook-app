const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Phonebook = require('./models/phonebook')


app.use(express.static('build'))
// parse the JSON string => convert JSON to JavaScript object
app.use(express.json())
app.use(cors())
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :post'
))


// add a POST body content to all request & display it using the :post token
morgan.token('post', function (req) {
  // JSON.stringify() converts a JavaScript value to a JSON string
  return JSON.stringify(req.body)
})


app.get('/api/persons', (request, response) => {
  // an empty param{} fetches all objs
  Phonebook.find({})
    .then(persons => {
    // toJSON() method returns a JSON string  of the result
      response.json(persons)
    })
})


app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(
      person => {
        if (person) { // person exits
          response.json(person)
        } else {
          /* if an id doesn't exist, the value of the
       person param will be null.
      */
          response.status(404).end() // return id not found
        }
      })
  /* If the format of the id is incorrect (malformed), then we will
   end up in the error handler defined in the catch block.
  */
    .catch(
      error => next(error)) // passed onto the error handler
})


app.get('/info', (request, response) => {
  Phonebook.find({})
    .then(person => {
      response.send(`<p>Phonebook has info for ${person.length} people
    <p>${Date()}</p>`)
    })
})


app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndRemove(request.params.id)
    .then(() => {
      response.json(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Phonebook({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Phonebook.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})




