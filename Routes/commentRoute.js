const express = require("express");
const { 
  addRating,
  addComment,
  getReviewsAndCommentsByMovie,
  getCommentsByMovie,
  getMovieRatingStats,
  getUserReviewsAndComments,
  updateComment,
  deleteItem
} = require("../controllers/commentController");
const isLogedIn = require("../middlewares/isLogedIn");

const reviewCommentRouter = express.Router();


reviewCommentRouter.post("/rating", isLogedIn, addRating);


reviewCommentRouter.post("/comment", isLogedIn, addComment);


reviewCommentRouter.get("/user", isLogedIn, getUserReviewsAndComments);


reviewCommentRouter.get("/movie/:movieId", getReviewsAndCommentsByMovie);


reviewCommentRouter.get("/movie/:movieId/comments", getCommentsByMovie);


reviewCommentRouter.get("/movie/:movieId/stats", getMovieRatingStats);


reviewCommentRouter.route("/:itemId")
  .patch(isLogedIn, updateComment) 
  .delete(isLogedIn, deleteItem);  

module.exports = reviewCommentRouter;
