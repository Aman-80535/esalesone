// server.js
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://esalesone.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.GMAIL_USER || process.env.SMTP_USER,
    pass: process.env.GMAIL_PASS || process.env.SMTP_PASS,
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Recipient and subject are required' });
  }

  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      await transporter.sendMail({
        from: `"Shopi E-Commerce" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: html || subject,
      });
      return res.status(200).json({ message: 'Email sent successfully!' });
    }

    console.log(`[Express Backend] Mock email sent to: ${to}, subject: ${subject}`);
    res.status(200).json({ message: 'Email processed successfully (mock delivery)' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
