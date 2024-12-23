// Import necessary modules
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialize the app
const app = express();
const PORT = 5000; // Backend server port

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: ["GET", "POST"], // Allowed HTTP methods
  })
);
app.use(bodyParser.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Using Gmail's SMTP server
  port: 465, // Secure port for SMTP
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, // Your email address (set in .env file)
    pass: process.env.EMAIL_PASS, // Your app password (set in .env file)
  },
});

// Verify connection to the SMTP server
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to SMTP server:", error);
  } else {
    console.log("SMTP server is ready to send emails.");
  }
});

// POST route to handle email sending
app.post("/send-email", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate input fields
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).send({ message: "All fields are required." });
  }

  // Email options for sending information to your email
  const mailOptions = {
    from: email, // User's email address
    to: process.env.EMAIL_USER, // Your email address to receive the message
    subject: `New Message from ${name}: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Subject: ${subject}

      Message:
      ${message}
    `,
  };

  // Email options for sending a "Thank you" message to the user
  const thankYouMailOptions = {
    from: process.env.EMAIL_USER, // Your email address
    to: email, // User's email address
    subject: "Thank You for Reaching Out!",
    text: `
      Hi ${name},

      Thank you for contacting us. We have received your message and will get back to you as soon as possible.

      Here’s a summary of your message:
      Subject: ${subject}
      Message: ${message}

      If you have any additional queries, feel free to reply to this email.

      Best regards,
      Your Team
    `,
  };

  try {
    // Send the email to your email
    await transporter.sendMail(mailOptions);
    console.log("Email sent to admin successfully!");

    // Send the thank-you email to the user
    await transporter.sendMail(thankYouMailOptions);
    console.log("Thank-you email sent to user successfully!");

    res.status(200).send({
      message: "Email sent successfully, and thank-you email sent to the user!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
