const mongoose = require('mongoose')

/* argv() returns all command line arguments that we passed when node.js
 process was being launched */
if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2] // access the cmd parameter

const url = `mongodb+srv://phonebookapp:${password}@cluster0.dolnsys.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// phonebooks will be the name of the collection in the database
// models are constructor functions
const Phonebook = mongoose.model('Phonebook', phonebookSchema)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')
  })

if (process.argv.length === 3) {
  /* an empty parameter {} means we get all the contact stored in the
  database */
  Phonebook.find({})
    .then(result => {
      console.log('phonebook: ')
      result.forEach(contact => {
        console.log(contact.name, contact.number)
      })
      mongoose.connection.close() // database connection closes
    })
}

if (process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]

  // create a new phonebook object
  const phonebook = new Phonebook({
    name: name,
    number: number,
  })

  /* when the obj is saved to the database, the event handler provided
  to the then() method is called.
  The result of the save operationis in the result parameter. */
  phonebook.save()
    .then(
      () => {
        console.log(`added ${name} number ${number} to phonebook`)
        return mongoose.connection.close()
      })
    .catch((err) => console.log(err))
}