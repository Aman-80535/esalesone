// server.js
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');



const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // React dev server
  credentials: true                // if you're using cookies or headers
}));

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    await transporter.sendMail({
      from: 'as6600422@gmail.com',
      to,
      subject,
      html,
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
