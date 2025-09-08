const express = require("express");
const { 
  addMovie,
  getAllMovies, 
  getMovieById, 
  updateMovie, 
  deleteMovie,
  searchMovies
} = require("../controllers/movieController");
const isLogedIn = require("../middlewares/isLogedIn");
const uploadImage = require("../middlewares/multer");

const movieRouter = express.Router();


movieRouter.route("/")
  .get(getAllMovies)
  .post(uploadImage.single("primaryImage"), addMovie); 

  movieRouter.route("/search").get(searchMovies)



movieRouter.route("/:movieId")
  .get(getMovieById)
  .patch(updateMovie)
  .delete(deleteMovie);

module.exports = movieRouter;
