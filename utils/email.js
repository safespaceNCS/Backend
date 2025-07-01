const nodemailer = require("nodemailer")

// Create Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Templates
const templates = {
  emailVerification: {
    subject: "Verify Your Email - Rafiqi",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Rafiqi!</h2>
        <p>Hello {{name}},</p>
        <p>Thank you for registering with Rafiqi. Please verify your email address by clicking the button below:</p>
        <a href="{{verificationUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>Rafiqi Team</p>
      </div>
    `,
  },
  passwordReset: {
    subject: "Password Reset -  Rafiqi",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Rafiqi Team</p>
      </div>
    `,
  }
}

// Send email function using Nodemailer
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    let html = templates[template]?.html || template
    let finalSubject = templates[template]?.subject || subject

    // Replace placeholders
    if (data) {
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g")
        html = html.replace(regex, data[key])
        finalSubject = finalSubject.replace(regex, data[key])
      })
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Rafiqi" <${process.env.SMTP_USER}>`,
      to,
      subject: finalSubject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent via Nodemailer:", result.messageId)
    return result
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}


module.exports = {
  sendEmail
}
