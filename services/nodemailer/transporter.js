const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: process.env.EMAIL_SERVICE,
    secure: process.env.EMAIL_SECURE,
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    }
})

// establish a connection
transporter.verify((error, success)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Server ready to send emails...")
    }
})

module.exports = transporter