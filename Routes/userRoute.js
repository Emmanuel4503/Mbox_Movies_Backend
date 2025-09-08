const express = require("express")
const {signup, getAllUsers,getUserById, getUserByIdAndDelete, updateUser, signIn, logOut, verifyEmail} = require("../controllers/userController")
const isLogedIn = require("../middlewares/isLogedIn")

const userRouter = express.Router()

userRouter.route("/signup").post(signup)
userRouter.route("/signin").post(signIn)
userRouter.route("/logout").post(isLogedIn, logOut)
userRouter.route("/verifyemail").post(verifyEmail); 

userRouter.route("/single/:id").get(getUserById).delete(getUserByIdAndDelete).patch( updateUser)

userRouter.route("/").get(getAllUsers)



module.exports = userRouter 