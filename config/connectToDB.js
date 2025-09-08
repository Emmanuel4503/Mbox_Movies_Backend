const mongoose = require('mongoose')
const dotEnv = require('dotenv')
dotEnv.config()

const mongoUri = process.env.mongo_uri

const connectDB = async () => {
    try {
        console.log("connecting");
        
        const connected = await mongoose.connect(mongoUri)
        if (connected) {
            console.log("connected Successfully ✔️");
        }
    } catch (error) {
        console.log(error);
        
    }
    
}

module.exports = connectDB