const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connected to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(err => {
    console.log('error connecting to MongoDB:', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'A name is required.']
  },
  number: {
    type: String,
    min: 8,
    validate: {
      validator: number => {
        const pattern1 = /^\d{2}-[0-9]*$/
        const pattern2 = /^\d{3}-[0-9]*$/
        const test1 = pattern1.test(number)
        const test2 = pattern2.test(number)
        return test1 || test2
      },
      message: props => `${props.value} is an invalid phone number!`
    },

    required: [true, 'A number is required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)