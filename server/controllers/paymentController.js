const crypto = require("crypto");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const paystackService = require("../services/paystackService");

exports.initiatePayment = async (req, res) => {
  try {
    const { invoiceId, email, amount: requestedAmount } = req.body;

    // Validate required fields
    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId is required" });
    }

    // Fetch the invoice
    const invoice = await Invoice.findById(invoiceId).populate({
      path: "student",
      populate: { path: "user", select: "email" },
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const payerEmail = email || invoice.student?.user?.email;
    if (!payerEmail) {
      return res.status(400).json({ error: "A payer email is required" });
    }

    const balance = invoice.totalAmount - invoice.amountPaid;
    const amount =
      requestedAmount === undefined ? balance : Number(requestedAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) {
      return res
        .status(400)
        .json({
          error:
            "Payment amount must be positive and no greater than the invoice balance",
        });
    }
    if (balance <= 0) {
      return res.status(400).json({ error: "Invoice is already paid" });
    }

    // Generate a unique reference
    const reference = crypto.randomBytes(16).toString("hex");

    // Create a new payment record
    const payment = new Payment({
      invoice: invoiceId,
      amount,
      email: payerEmail,
      reference,
    });
    await payment.save();

    // Convert Naira to Kobo
    const amountInKobo = Math.round(amount * 100);

    // Initiate payment with Paystack
    const paystackResponse = await paystackService.post(
      "/transaction/initialize",
      {
        email: payerEmail,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.CLIENT_ORIGIN}/payment/callback`,
      },
    );

    res.json({
      success: true,
      message: "Payment initiated successfully",
      data: paystackResponse.data.data,
    });
  } catch (error) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message,
    );
    res
      .status(500)
      .json({
        error: error.response?.data?.message || "Payment initialization failed",
      });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystackService.get(
      `/transaction/verify/${reference}`,
    );

    const transaction = response.data.data;

    if (transaction.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful",
      });
    }

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Verify amount
    const expectedAmount = Math.round(payment.amount * 100);

    if (transaction.amount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    const wasSuccessful = payment.status === "success";
    payment.status = "success";
    payment.paystackTransactionId = transaction.id;

    await payment.save();

    if (!wasSuccessful) {
      const invoice = await Invoice.findById(payment.invoice);
      if (invoice) {
        invoice.amountPaid += payment.amount;
        invoice.status =
          invoice.amountPaid >= invoice.totalAmount ? "paid" : "partial";
        await invoice.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const transaction = event.data;

      const payment = await Payment.findOne({
        reference: transaction.reference,
      });

      if (payment) {
        const expectedAmount = Math.round(payment.amount * 100);

        if (transaction.amount === expectedAmount) {
          const wasSuccessful = payment.status === "success";
          payment.status = "success";
          payment.paystackTransactionId = transaction.id;

          await payment.save();

          if (!wasSuccessful) {
            const invoice = await Invoice.findById(payment.invoice);
            if (invoice) {
              invoice.amountPaid += payment.amount;
              invoice.status =
                invoice.amountPaid >= invoice.totalAmount ? "paid" : "partial";
              await invoice.save();
            }
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);

    return res.sendStatus(500);
  }
};