const express = require("express")
const {signup, getAllUsers, getUserById, getUserByIdAndDelete, updateUser, signIn, logOut, verifyEmail} = require("../controllers/userController")
const isLogedIn = require("../middlewares/isLogedIn")

const userRouter = express.Router()

// Authentication routes
userRouter.route("/signup").post(signup)
userRouter.route("/signin").post(signIn)
userRouter.route("/logout").post(isLogedIn, logOut)

// Email verification routes - BOTH are needed
userRouter.route("/verifyemail").post(verifyEmail)  // For API calls (POST with token in body)
userRouter.route("/verify/:token").get(verifyEmail) // For email links (GET with token in URL)

// User management routes
userRouter.route("/single/:id").get(getUserById).delete(getUserByIdAndDelete).patch(updateUser)
userRouter.route("/").get(getAllUsers)

module.exports = userRouter