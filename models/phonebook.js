const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const validators = [
  {
    validator: number => {
      (number[2] === '-' || number[3] === '-') && number.length < 9
        ? false
        : true
    },
    msg: 'must contain atleast 8 digits'
  },
  {
    validator: number => {
      return /^\d{2,3}-\d+$/.test(number)
    },
    msg: 'invalid phone number'
  }
]

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: validators,
    required: true
  }
})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phonebook', phonebookSchema)