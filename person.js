const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    }
  }
}, {
  timestamps: true
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;