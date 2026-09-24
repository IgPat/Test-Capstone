const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendWelcomeEmail = async (email, name, password) => {
  const mailOptions = {
    from: `"School Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome - Your Student Account Has Been Created",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome, ${name}!</h2>

        <p>Your student account has been successfully created.</p>

        <p>You can use the credentials below to log in:</p>

        <p>
          <strong>Email:</strong> ${email}<br>
          <strong>Password:</strong> ${password}
        </p>

        <p>
          Please log in and change your password after your first login.
        </p>

        <p>Welcome aboard!</p>

        <p>
          Regards,<br>
          School Management System Team
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;