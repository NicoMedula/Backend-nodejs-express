import transporter, { accountEmail } from '../config/nodemailer.js';

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
