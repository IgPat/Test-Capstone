const crypto = require("crypto");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const StudentProfile = require("../models/StudentProfile");

const computeStatus = (totalAmount, amountPaid) => {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid >= totalAmount) return "paid";
  return "partial";
};

// POST /api/invoices - Admin generates an invoice
exports.createInvoice = async (req, res) => {
  try {
    const student = req.body.student || req.body.studentId;
    const term = req.body.term || "Term 1";
    let lineItems = req.body.lineItems;
    let totalAmount = req.body.totalAmount;

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      const description = req.body.description || "School Fees & Tuition";
      const amt = Number(totalAmount || 0);
      if (amt <= 0)
        return res.status(400).json({
          message: "A valid total amount or lineItems array is required",
        });
      lineItems = [{ label: description, amount: amt }];
      totalAmount = amt;
    } else {
      totalAmount = lineItems.reduce(
        (sum, li) => sum + Number(li.amount || 0),
        0,
      );
    }

    if (!student) {
      return res.status(400).json({ message: "student ID is required" });
    }

    const invoice = await Invoice.create({
      student,
      term,
      lineItems,
      totalAmount,
    });

    const profile = await StudentProfile.findById(student);
    if (profile) {
      await Notification.create({
        user: profile.user,
        message: `A new invoice for ${term} (₦${totalAmount}) has been issued.`,
      });
    }

    res.status(201).json(invoice);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create invoice", error: err.message });
  }
};

// POST /api/invoices/:id/payments - Admin records any payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "A positive amount is required" });

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (req.user.role === "student") {
      const ownsInvoice =
        req.user.studentProfile &&
        invoice.student.toString() === req.user.studentProfile.toString();
      if (!ownsInvoice)
        return res.status(403).json({ message: "Forbidden: not your invoice" });
    }

    await Payment.create({
      invoice: invoice._id,
      amount: Number(amount),
      email: req.user.email,
      reference: reference || `MANUAL-${crypto.randomUUID()}`,
      method: method || "simulated",
    });

    invoice.amountPaid += Number(amount);
    invoice.status = computeStatus(invoice.totalAmount, invoice.amountPaid);
    await invoice.save();

    res.status(201).json(invoice);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to record payment", error: err.message });
  }
};

// GET /api/invoices/my-invoices
exports.getMyInvoices = async (req, res) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(404).json({ message: "No student profile linked" });
    }
    req.params.id = req.user.studentProfile.toString();
    return exports.getStudentInvoices(req, res);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch invoices", error: err.message });
  }
};

// GET /api/invoices/student/:id
exports.getStudentInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ student: req.params.id }).sort({
      createdAt: -1,
    });
    const invoiceIds = invoices.map((i) => i._id);
    const payments = await Payment.find({ invoice: { $in: invoiceIds } }).sort({
      date: -1,
    });

    const balance = invoices.reduce(
      (sum, i) => sum + (i.totalAmount - i.amountPaid),
      0,
    );

    // Map invoice number and description for client view compatibility
    const formatted = invoices.map((inv) => {
      const obj = inv.toObject();
      obj.invoiceNumber = `INV-${inv._id.toString().slice(-6).toUpperCase()}`;
      obj.description =
        inv.lineItems?.map((li) => li.label).join(", ") || "School Fees";
      return obj;
    });

    res.json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch invoices", error: err.message });
  }
};

// GET /api/invoices  - Admin: all invoices (optionally filter by term/status)
exports.listInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.term) filter.term = req.query.term;
    if (req.query.status) filter.status = req.query.status;
    const invoices = await Invoice.find(filter)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    const formatted = invoices.map((inv) => {
      const obj = inv.toObject();
      obj.invoiceNumber = `INV-${inv._id.toString().slice(-6).toUpperCase()}`;
      obj.description =
        inv.lineItems?.map((li) => li.label).join(", ") || "School Fees";
      return obj;
    });

    res.json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list invoices", error: err.message });
  }
};

exports.getOwnerIdForInvoiceRoute = async (req) => req.params.id;

