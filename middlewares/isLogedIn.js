
const jwt = require('jsonwebtoken');
const BlacklistedTokens = require('../model/tokenModel');
const mongoose = require('mongoose');
const User = mongoose.model('userModel'); 

const isLogedIn = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Please provide a token'
    });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log('Decoded JWT:', decoded); 

    
    const isBlacklisted = await BlacklistedTokens.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    
    const user = await User.findById(decoded.id).select('name email');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.userId = user._id.toString(); 
    req.user = user; 
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      status: 'error',
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
};

module.exports = isLogedIn;
