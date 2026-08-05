const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const defaultFrom = process.env.SMTP_FROM || 'support@graceandforce.com';

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email send because SMTP_USER or SMTP_PASS is missing in .env');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `ThinkQuest Olympiad <${defaultFrom}>`,
      to,
      subject,
      html,
    });
    console.log(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
}

module.exports = {
  sendEmail,
};
