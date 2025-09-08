const handleDuplicateError = (error) => {
    const errorKey = Object.keys(error.keyValue)[0];
    const errorVal = Object.values(error.keyValue)[0];
    const errorMessage = new Error(`${errorKey} of ${errorVal} already exists.`);
    const statusCode = 400;
    return {
      statusCode,
      errorMessage: errorMessage.message,
    };
  };
  
  const handleValidationError = (err) => {
    console.log('ValidationError:', err);
    const errorMessage = Object.values(err.errors).map((item) => item.message)[0];
    const statusCode = 400;
    return {
      statusCode,
      errorMessage,
    };
  };
  
  const errorHandler = (err, req, res, next) => {
    console.log('ErrorHandler:', err);
  
    // Duplicate error
    if (err.code === 11000) {
      const error = handleDuplicateError(err);
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.errorMessage,
      });
    }
  
    // Token errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Ogbeni your Token has expired',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Ogbeni your token is invalid',
      });
    }
  
    // Validation error
    if (err.name === 'ValidationError') {
      const error = handleValidationError(err);
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.errorMessage, // Fixed from errorValue
      });
    }
  
    // Cast error
    if (err.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: `Invalid ${err.path} of ${err.value}`,
      });
    }
  
    // Unhandled errors
    console.error('Unhandled error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred!',
      error: err.message, // Include error message for debugging
    });
  };
  
  module.exports = errorHandler;