const transporter = require("./transporter")
const sendVerificationEmail = async (email, token, name) => {
    const mailOptions = {
        to: email,
        from: "oladipoemmanuel453@gmail.com",
        subject: `Mbox Email Verification`,
        html: `
             <div style="max-width: 600px; margin: auto; background-color: #121212; padding: 2rem; border-radius: 10px; font-family: Arial, sans-serif; color: #ffffff; text-align: center;">
    <h1 style="color: #e50914; margin-bottom: 1rem;">Hello, ${name} 👋</h1>
    <p style="font-size: 1rem; line-height: 1.5; color: #dddddd;">
      Thanks for signing up with <strong>Mbox Movies</strong>! To complete your registration and activate your account, please verify your email by clicking the button below:
    </p>
    <a href="http://localhost:5173/verify/${token}" 
       style="display: inline-block; margin-top: 1.5rem; background-color: #e50914; color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 5px; font-weight: bold;">
       Verify Email
    </a>
    <p style="margin-top: 2rem; font-size: 0.85rem; color: #888;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendVerificationEmail