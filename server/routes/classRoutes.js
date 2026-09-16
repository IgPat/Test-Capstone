const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/classController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

router.get("/public", ctrl.listPublicClasses);
router.use(protect);

router.get("/", ctrl.listClasses); // admin & student
router.get("/:id", ctrl.getClass);
router.post("/", requireRole("admin"), ctrl.createClass);
router.put("/:id", requireRole("admin"), ctrl.updateClass);
router.delete("/:id", requireRole("admin"), ctrl.deleteClass);
router.post("/:id/enroll", requireRole("admin"), ctrl.enrollStudent);
router.post("/:id/unenroll", requireRole("admin"), ctrl.unenrollStudent);

module.exports = router;
