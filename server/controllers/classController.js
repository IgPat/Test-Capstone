const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

// GET /api/classes/public
exports.listPublicClasses = async (req, res) => {
  try {
    const classes = await Class.find({}, "_id name").sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list public classes", error: err.message });
  }
};

// GET /api/classes
exports.listClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("students", "admissionNumber");
    res.json(classes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list classes", error: err.message });
  }
};

// GET /api/classes/:id
exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate({
      path: "students",
      populate: { path: "user", select: "name email" },
    });
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json(cls);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get class", error: err.message });
  }
};

// POST /api/classes
exports.createClass = async (req, res) => {
  try {
    const { name, subjects, capacity, homeroom } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });
    const cls = await Class.create({ name, subjects, capacity, homeroom });
    res.status(201).json(cls);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Class name already exists" });
    res
      .status(500)
      .json({ message: "Failed to create class", error: err.message });
  }
};

// PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json(cls);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update class", error: err.message });
  }
};

// DELETE /api/classes/:id
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    await StudentProfile.updateMany(
      { classId: cls._id },
      { $unset: { classId: 1 } },
    );
    res.json({ message: "Class deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete class", error: err.message });
  }
};

// POST /api/classes/:id/enroll  { studentId }
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } },
      { new: true },
    );
    await StudentProfile.findByIdAndUpdate(studentId, { classId: cls._id });
    res.json(cls);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to enroll student", error: err.message });
  }
};

// POST /api/classes/:id/unenroll  { studentId }
exports.unenrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { $pull: { students: studentId } },
      { new: true },
    );
    await StudentProfile.findByIdAndUpdate(studentId, {
      $unset: { classId: 1 },
    });
    res.json(cls);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to unenroll student", error: err.message });
  }
};
