const User = require("../models/User");
const sendWelcomeEmail = require("../config/mail");
const nodemailer = require("nodemailer");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    await sendWelcomeEmail(email, name, password);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, email, subject, text, html, name, password } = req.body;
    const recipient = to || email;

    if (!recipient) {
      return res.status(400).json({ message: "Recipient email is required ('to' or 'email')" });
    }

    if (name && password && !subject && !text && !html) {
      await sendWelcomeEmail(recipient, name, password);
      return res.status(200).json({ message: "Welcome email sent successfully" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"School Management System" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject || "Notification from School Management System",
      text: text || undefined,
      html: html || `<p>${text || "You have a new message from School Management System."}</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

module.exports = {
  createUser,
  sendEmail,
};
