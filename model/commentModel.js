const mongoose = require('mongoose');

const reviewCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: [true, "User ID is required"]
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movies',
    required: [true, "Movie ID is required"]
  },
  rating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"]
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});



reviewCommentSchema.index(
  { userId: 1, movieId: 1, rating: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { rating: { $exists: true } }
  }
);


reviewCommentSchema.pre('validate', function(next) {
  if (!this.rating && (!this.comment || !this.comment.trim())) {
    const error = new Error('Either rating or comment must be provided');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});


reviewCommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const reviewCommentModel = mongoose.model('ReviewsComments', reviewCommentSchema);

module.exports = reviewCommentModel;
