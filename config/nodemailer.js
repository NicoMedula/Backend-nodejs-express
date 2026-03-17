import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';

export const accountEmail = 'alphasoftwebs@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection failed:', error.message);
  } else {
    console.log('SMTP server ready to send emails');
  }
});

export default transporter;
