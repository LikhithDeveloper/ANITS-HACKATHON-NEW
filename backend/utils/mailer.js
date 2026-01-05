const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // If no credentials, mock it
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('---------------------------------------------------');
      console.log(`[Mock Email System]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: \n${text}`);
      console.log('---------------------------------------------------');
      console.log('To send real emails, set EMAIL_USER and EMAIL_PASS in .env');
      return true; 
  }

  try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"TalentScout AI" <${process.env.EMAIL_User}>`,
        to,
        subject,
        text,
      });
      console.log(`Email sent to ${to}`);
      return true;
  } catch (err) {
      console.error("Email Error:", err.message);
      return false;
  }
};

module.exports = sendEmail;
