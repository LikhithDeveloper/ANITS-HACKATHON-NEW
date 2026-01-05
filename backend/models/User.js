const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  companyName: {
    type: String,
    required: [true, "Please add your company's name"]
  },
  companyWebsite: {
    type: String,
    required: [true, "Please add your company's website"]
  },
  role: {
    type: String,
    enum: ['recruiter', 'admin'],
    default: 'recruiter'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
