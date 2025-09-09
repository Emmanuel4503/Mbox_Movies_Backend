const userModel = require("../model/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Blacklisted = require("../model/tokenModel")
const generateRandomString = require("../utils/getRandomString")
const sendVerificationEmail = require("../services/nodemailer/sendVerificationEmail")



async function signup(req, res, next) {
  try {
      const { email, password } = req.body;
      
      
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
          return res.status(400).json({
              status: "error",
              message: "Email already registered"
          });
      }
      
      const Salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, Salt);
      
      const verificationToken = generateRandomString(10);
      
      const verificationExp = Date.now() + 600000; 

      const user = await userModel.create({
          ...req.body, 
          password: hashed, 
          verificationToken, 
          verificationExp
      });

      
      sendVerificationEmail(user.email, verificationToken, user.name);
      
      res.status(201).json({
          status: "Success",
          message: "User created successfully. Please check your email to verify your account.",
          user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              isVerified: user.isVerified
          }
      });
  } catch (error) {
      
      if (error.code === 11000) {
          return res.status(400).json({
              status: "error",
              message: "Email already registered"
          });
      }
      next(error);
  }
}






const verifyEmail = async (req, res, next) => {
  try {
    // Get token from either URL params (GET request) or request body (POST request)
   const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Verification token is missing",
      });
    }

    const user = await userModel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Invalid or expired verification token",
      });
    }

    if (Date.now() > parseInt(user.verificationExp)) {
      return res.status(400).json({
        status: "error",
        message: "Verification token has expired",
      });
    }

    await userModel.findByIdAndUpdate(user._id, {
      verificationExp: null, 
      verificationToken: null, 
      isVerified: true
    });

    // For GET requests (email links), redirect to success page or send HTML response
    if (req.method === 'GET') {
      return res.status(200).send(`
        <html>
          <head>
            <title>Email Verified - Mbox Movies</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background-color: #121212; 
                color: white; 
                text-align: center; 
                padding: 50px; 
              }
              .container { 
                max-width: 500px; 
                margin: auto; 
                background: #1f1f1f; 
                padding: 30px; 
                border-radius: 10px; 
              }
              .success { color: #4CAF50; }
              .btn { 
                background-color: #e50914; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block; 
                margin-top: 20px; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">✅ Email Verified Successfully!</h1>
              <p>Welcome to Mbox Movies, ${user.name}!</p>
              <p>Your account has been activated. You can now sign in and start exploring movies.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin" class="btn">Go to Sign In</a>
            </div>
          </body>
        </html>
      `);
    }

    // For POST requests (API calls), return JSON response
    return res.status(200).json({
      status: "success",
      message: "Email verified successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    // Handle errors differently for GET vs POST requests
    if (req.method === 'GET') {
      return res.status(500).send(`
        <html>
          <head>
            <title>Verification Error - Mbox Movies</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background-color: #121212; 
                color: white; 
                text-align: center; 
                padding: 50px; 
              }
              .container { 
                max-width: 500px; 
                margin: auto; 
                background: #1f1f1f; 
                padding: 30px; 
                border-radius: 10px; 
              }
              .error { color: #f44336; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Verification Failed</h1>
              <p>There was an error verifying your email. Please try again or contact support.</p>
            </div>
          </body>
        </html>
      `);
    }
    
    return res.status(500).json({
      status: "error",
      message: "Server error while verifying email",
    });
  }
};



async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Email or password incorrect"
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res.status(404).json({
        status: "error",
        message: "Email or password incorrect"
      });
    }

    console.log('Server time at signIn:', new Date()); 
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET, 
      { expiresIn: "30m" }
    );

    res.status(200).json({
      status: "success",
      message: "User successfully signed in",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('SignIn error:', error);
    next(error);
  }
}


const logOut = async (req, res) => {
    try {

    const {token} = req.body
    await Blacklisted.create({token})
    res.status(200).json({
        status: "success",
        message: "logOut Successfully"
    })

    } catch (error) {
        console.log(error);
        
    }
    
}





const getAllUsers = async (req, res) => {
    const Add = await userModel.find(req.body)
    if (!Add) {
           res.status(400).json({
            status: "error",
            message: "All user not listed",
            Add
         })
         return
    }
    res.status(200).json({
        status: "Success",
        message: "All user listed",
        Add
    })
}


const getUserById = async (req, res) => {
    const Add = await userModel.findById(req.params.id)
    if (!Add) {
           res.status(400).json({
            status: "error",
            message: "Single user not listed",
            Add
         })
         return
    }
    res.status(200).json({
        status: "Success",
        message: "Single user listed ",
        Add
    })
}


const updateUser = async (req, res) => {
    try {
        const {id} = req.params
      
        const updates =  await userModel.findByIdAndUpdate(id, req.body); 

        

        if (!updates) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

    



const getUserByIdAndDelete = async (req, res) => {
    const {id} = req.params
   await userModel.findByIdAndDelete(id)
    res.status(200).json({
        status: "Success",
        message: "single user deleted successfully",
    })
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByIdAndDelete,
    updateUser,
    signup,
    signIn,
    logOut,
    verifyEmail
}
