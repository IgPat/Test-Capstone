const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const sendWelcomeEmail = require("../config/mail");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
// Self-registration always creates a "student" account. Admin accounts are
// seeded (see seed.js) or promoted manually - never created from a public form.
exports.register = async (req, res) => {
  try {
    const { name, email, password, admissionNumber, classId, gender } =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const finalAdmissionNumber = admissionNumber?.trim() || `STU-${Date.now()}`;
    const finalGender = ["male", "female", "other"].includes(gender)
      ? gender
      : "other";

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "student",
    });

    const profile = await StudentProfile.create({
      user: user._id,
      admissionNumber: finalAdmissionNumber,
      gender: finalGender,
      classId: classId || undefined,
    });

    user.studentProfile = profile._id;
    await user.save();

    // Send welcome email asynchronously without blocking registration response
    sendWelcomeEmail(normalizedEmail, name, password).catch((emailErr) => {
      console.error("Failed to send welcome email on registration:", emailErr.message);
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Admission number already in use" });
    }
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};
