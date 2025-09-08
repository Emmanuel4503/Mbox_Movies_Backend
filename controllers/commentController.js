
const mongoose = require('mongoose');
const reviewCommentModel = require("../model/commentModel"); 
const User = mongoose.model('userModel'); 
const Movies = mongoose.model('Movies'); 

const addRating = async (req, res, next) => {
  try {
    const { movieId, rating } = req.body;
    const userId = req.user._id.toString();

    if (!movieId || !rating) {
      return res.status(400).json({
        status: 'error',
        message: 'movieId and rating are required fields'
      });
    }

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid movieId format'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const existingRating = await reviewCommentModel.findOne({ 
      userId, 
      movieId, 
      rating: { $exists: true } 
    });

    let review;
    if (existingRating) {
      review = await reviewCommentModel
        .findByIdAndUpdate(
          existingRating._id,
          { rating },
          { new: true, runValidators: true }
        )
        .populate('userId', 'name email')
        .populate('movieId', 'originalTitle');

      res.status(200).json({
        status: 'success',
        message: 'Rating updated successfully',
        data: review
      });
    } else {
      const newRating = await reviewCommentModel.create({
        userId,
        movieId,
        rating
      });

      review = await reviewCommentModel
        .findById(newRating._id)
        .populate('userId', 'name email')
        .populate('movieId', 'originalTitle');

      res.status(201).json({
        status: 'success',
        message: 'Rating added successfully',
        data: review
      });
    }
  } catch (error) {
    console.error('Error in addRating:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already rated this movie'
      });
    }
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { movieId, comment } = req.body;
    const userId = req.user._id.toString();

    if (!movieId || !comment) {
      return res.status(400).json({
        status: "error",
        message: "movieId and Comment are required fields"
      });
    }

    if (!comment.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot be empty"
      });
    }

    const newComment = await reviewCommentModel.create({
      userId: req.userId,
      movieId: movieId,
      comment: comment.trim()
    });

    const populatedComment = await reviewCommentModel
      .findById(newComment._id)
      .populate('userId', 'name email')
      .populate('movieId', 'originalTitle');

    res.status(201).json({
      status: "success",
      message: "Comment added successfully",
      data: populatedComment
    });

  } catch (error) {
    console.error('Error in addComment:', error);
    next(error);
  }
};


const getReviewsAndCommentsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        status: "error",
        message: "Movie ID is required"
      });
    }

    const reviewsAndComments = await reviewCommentModel
      .find({ movieId: movieId })
      .populate('userId', 'name email')
      .populate('movieId', 'originalTitle')
      .sort({ createdAt: -1 });

    const ratings = reviewsAndComments.filter(item => item.rating);
    const comments = reviewsAndComments.filter(item => item.comment && !item.rating);

    res.status(200).json({
      status: "success",
      message: "Reviews and comments retrieved successfully",
      data: {
        ratings: {
          count: ratings.length,
          data: ratings
        },
        comments: {
          count: comments.length,
          data: comments
        },
        total: reviewsAndComments.length
      }
    });

  } catch (error) {
    console.error('Error in getReviewsAndCommentsByMovie:', error);
    next(error);
  }
};


const getCommentsByMovie = async (req, res, next) => {
    try {
      const { movieId } = req.params;
  
      if (!movieId) {
        return res.status(400).json({
          status: "error",
          message: "Movie ID is required"
        });
      }
  
      
      if (!mongoose.isValidObjectId(movieId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid movie ID format"
        });
      }
  
      
      const comments = await reviewCommentModel
        .find({ 
          movieId: movieId, 
          comment: { $exists: true, $ne: "", $ne: null }
        })
        .populate('userId', 'name email')
        .populate('movieId', 'originalTitle')
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        status: "success",
        message: "Comments retrieved successfully",
        count: comments.length,
        data: comments
      });
  
    } catch (error) {
      console.error('Error in getCommentsByMovie:', error);
      next(error);
    }
  };

const getMovieRatingStats = async (req, res, next) => {
    try {
      const { movieId } = req.params;
  
      if (!movieId) {
        return res.status(400).json({
          status: "error",
          message: "Movie ID is required"
        });
      }
  
      
      if (!mongoose.isValidObjectId(movieId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid movie ID format"
        });
      }
  
      const stats = await reviewCommentModel.aggregate([
        { 
          $match: { 
            movieId: new mongoose.Types.ObjectId(movieId),
            rating: { $exists: true, $ne: null }
          } 
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            ratingDistribution: {
              $push: "$rating"
            }
          }
        },
        {
          $project: {
            _id: 0,
            averageRating: { $round: ["$averageRating", 1] },
            totalRatings: 1,
            ratingDistribution: {
              "5": {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 5] }
                  }
                }
              },
              "4": {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 4] }
                  }
                }
              },
              "3": {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 3] }
                  }
                }
              },
              "2": {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 2] }
                  }
                }
              },
              "1": {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 1] }
                  }
                }
              }
            }
          }
        }
      ]);
  
      const result = stats.length > 0 ? stats[0] : {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
      };
  
      res.status(200).json({
        status: "success",
        message: "Movie rating statistics retrieved successfully",
        data: result
      });
  
    } catch (error) {
      console.error('Error in getMovieRatingStats:', error);
      next(error);
    }
  };


const getUserReviewsAndComments = async (req, res, next) => {
  try {
    const userId = req.userId;

    const userItems = await reviewCommentModel
      .find({ userId: userId })
      .populate('movieId', 'originalTitle primaryImage')
      .sort({ createdAt: -1 });

    const ratings = userItems.filter(item => item.rating);
    const comments = userItems.filter(item => item.comment && !item.rating);

    res.status(200).json({
      status: "success",
      message: "User reviews and comments retrieved successfully",
      data: {
        ratings: {
          count: ratings.length,
          data: ratings
        },
        comments: {
          count: comments.length,
          data: comments
        }
      }
    });

  } catch (error) {
    console.error('Error in getUserReviewsAndComments:', error);
    next(error);
  }
};


const updateComment = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { comment } = req.body;
    const userId = req.userId;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot be empty"
      });
    }

    const existingItem = await reviewCommentModel.findById(itemId);
    
    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found"
      });
    }

    if (existingItem.userId.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You can only update your own comments"
      });
    }

    if (existingItem.rating && !existingItem.comment) {
      return res.status(400).json({
        status: "error",
        message: "Cannot update rating as comment. Use rating endpoint instead."
      });
    }

    const updatedComment = await reviewCommentModel
      .findByIdAndUpdate(
        itemId,
        { comment: comment.trim() },
        { new: true, runValidators: true }
      )
      .populate('userId', 'name email')
      .populate('movieId', 'originalTitle');

    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      data: updatedComment
    });

  } catch (error) {
    console.error('Error in updateComment:', error);
    next(error);
  }
};


const deleteItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    const existingItem = await reviewCommentModel.findById(itemId);
    
    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Item not found"
      });
    }

    if (existingItem.userId.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own items"
      });
    }

    await reviewCommentModel.findByIdAndDelete(itemId);

    const itemType = existingItem.rating ? "rating" : "comment";

    res.status(200).json({
      status: "success",
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`
    });

  } catch (error) {
    console.error('Error in deleteItem:', error);
    next(error);
  }
};

module.exports = {
  addRating,
  addComment,
  getReviewsAndCommentsByMovie,
  getCommentsByMovie,
  getMovieRatingStats,
  getUserReviewsAndComments,
  updateComment,
  deleteItem
};
