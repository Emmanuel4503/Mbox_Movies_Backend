const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require('./config/connectToDB');
const userRouter = require("./Routes/userRoute");
const errorHandler = require("./middlewares/errorHandler");
const movieRouter = require("./Routes/movieRoute");
const reviewCommentRouter = require("./Routes/commentRoute");
const favoriteRouter = require("./Routes/favoritesRoute");


const app = express();
const port = 5000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());

app.use(cors({
  origin: ['https://mbox-movies-front-end.vercel.app', 'https://mboxadmin.netlify.app',], 
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("Welcome to Mbox movies");
});

// User routes
app.use("/mbox/user", userRouter);
app.use("/api/movies", movieRouter);
app.use("/review-comments", reviewCommentRouter)
app.use("/api/favorites", favoriteRouter)

// 404 handler for undefined routes
app.all("/{*any}", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `${req.method} ${req.originalUrl} is not a valid endpoint.`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});