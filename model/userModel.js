const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is important!"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken:{
        type:String
    },
    verificationExp: {
        type: String
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movies'
      }],
})


const userModel = mongoose.model('userModel', userSchema)

module.exports = userModel