const crypto = require("crypto")

const generateRandomString = ( num = 8 )=>{
    const token = crypto.randomBytes(num).toString("hex") // abcdef0123456789
    return token
}

module.exports = generateRandomString