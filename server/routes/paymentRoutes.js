const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/initiate", protect, paymentController.initiatePayment);
router.get("/verify/:reference", protect, paymentController.verifyPayment);
router.post("/webhook", paymentController.paystackWebhook);

module.exports = router;
