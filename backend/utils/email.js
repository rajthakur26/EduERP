const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const welcomeEmail = (name, email, role) => ({
  to: email,
  subject: 'Welcome to EduERP',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:8px">
      <h2 style="color:#4f46e5">Welcome to EduERP!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been created as <strong>${role}</strong>.</p>
      <p>Login at <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
      <p style="color:#666;font-size:12px">EduERP Team</p>
    </div>
  `,
});

module.exports = { sendEmail, welcomeEmail };
