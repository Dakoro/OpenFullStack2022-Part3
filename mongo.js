const mongoose = require('mongoose')

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });

if (process.argv.length < 3) {
    console.log('please provide the password as argument: node index.js <password>')
    process.exit(1)
}
// Don't save the password to Github
const password = process.argv[2]

const url = `mongodb+srv://Dakoro:${password}@cluster-phonebook.rdkyduo.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {
        type: String,  
        minLength: 3, 
        required: true
    },
    number: {
        type: String,

        min: 8,

        format: {

            test: function(number) {
                    const pattern1 = /^\d{2}-[0-9]*$/
                    const pattern2 = /^\d{3}-[0-9]*$/
                    const test1 = pattern1.test(number)
                    const test2 = pattern2.test(number)
                    return test1 || test2
            },

            message: number => `${number} is an invalid phone number!`    
        },

        required: true 
    } 
})

const Person = mongoose.model('Person', personSchema)

const name = process.argv[3]

const number = process.argv[4]

const person = new Person ({
    name: name,
    number: number,
})

if (name != undefined && number !== undefined) {
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to the phonebook`)
        mongoose.connection.close()
    })
}


Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(item => {
        console.log(`${item.name} ${item.number}`)
    })
    mongoose.connection.close()
})
