const express = require('express');
const { addFavorite, getFavorites, deleteFavorite } = require('../controllers/favorites');
const isLogedIn = require('../middlewares/isLogedIn');

const favoriteRouter = express.Router();


favoriteRouter.route('/')
  .post(isLogedIn, addFavorite) 
  .get(isLogedIn, getFavorites);

favoriteRouter.route('/:movieId')
  .delete(isLogedIn, deleteFavorite); 

module.exports = favoriteRouter;
