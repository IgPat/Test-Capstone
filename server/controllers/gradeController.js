const Grade = require('../models/Grade');

const letterFor = (pct) => {
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  if (pct >= 40) return 'E';
  return 'F';
};

// POST /api/grades - Admin records a grade entry
exports.createGrade = async (req, res) => {
  try {
    // Accept both 'student' and 'studentId' from frontend for flexibility
    const student = req.body.student || req.body.studentId;
    const { subject, term, score, maxScore, remark, academicYear } = req.body;
    if (!student || !subject || !term || score === undefined) {
      return res.status(400).json({ message: 'student, subject, term and score are required' });
    }
    const grade = await Grade.create({ student, subject, term, academicYear, score, maxScore: maxScore || 100, remark });
    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record grade', error: err.message });
  }
};

// PUT /api/grades/:id
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update grade', error: err.message });
  }
};

// DELETE /api/grades/:id
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete grade', error: err.message });
  }
};

// GET /api/grades/student/:id?term=  - report card view, grouped by term
exports.getStudentReportCard = async (req, res) => {
  try {
    const filter = { student: req.params.id };
    if (req.query.term) filter.term = req.query.term;

    const grades = await Grade.find(filter).sort({ term: 1, subject: 1 });

    // Flat list for admin grade table view
    if (req.query.flat === '1') {
      return res.json(grades);
    }

    const byTerm = {};
    grades.forEach((g) => {
      if (!byTerm[g.term]) byTerm[g.term] = { entries: [], academicYear: g.academicYear };
      byTerm[g.term].entries.push(g);
    });

    const reportCard = Object.entries(byTerm).map(([term, { entries, academicYear }]) => {
      const totalPct = entries.reduce((sum, e) => sum + (e.score / e.maxScore) * 100, 0);
      const average = Math.round((totalPct / entries.length) * 10) / 10;
      return {
        term,
        academicYear,
        // 'grades' key for StudentGrades.jsx; 'subjects' kept for compatibility
        grades: entries.map((e) => ({
          _id: e._id,
          subject: e.subject,
          score: e.score,
          maxScore: e.maxScore,
          percentage: Math.round((e.score / e.maxScore) * 1000) / 10,
          remark: e.remark,
        })),
        subjects: entries.map((e) => ({
          subject: e.subject,
          score: e.score,
          maxScore: e.maxScore,
          percentage: Math.round((e.score / e.maxScore) * 1000) / 10,
          remark: e.remark,
        })),
        averageScore: average,  // for StudentGrades.jsx
        average,                // legacy
        grade: letterFor(average),
      };
    });

    res.json(reportCard);
  } catch (err) {
    res.status(500).json({ message: 'Failed to build report card', error: err.message });
  }
};


// GET /api/grades/my-grades
exports.getMyReportCard = async (req, res) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(404).json({ message: 'No student profile linked' });
    }
    req.params.id = req.user.studentProfile.toString();
    return exports.getStudentReportCard(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report card', error: err.message });
  }
};

exports.getOwnerIdForGradeRoute = async (req) => req.params.id;
