const mongoose = require('mongoose'); 
const userModel = require('../model/userModel');
const movieModel = require('../model/movieModel');


const addFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id; 

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid movie ID format'
      });
    }

    
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }

    
    const user = await userModel.findById(userId);
    if (user.favorites.includes(movieId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Movie already in favorites'
      });
    }

    
    user.favorites.push(movieId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie added to favorites',
      data: { movieId }
    });
  } catch (error) {
    next(error);
  }
};


const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    
    const user = await userModel
      .findById(userId)
      .populate({
        path: 'favorites',
        select: '_id originalTitle primaryImage releaseDate'
      });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Favorites retrieved successfully',
      data: user.favorites
    });
  } catch (error) {
    next(error);
  }
};


const deleteFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid movie ID format'
      });
    }

    
    const user = await userModel.findById(userId);
    if (!user.favorites.includes(movieId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found in favorites'
      });
    }

    
    user.favorites = user.favorites.filter(id => id.toString() !== movieId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite
};
