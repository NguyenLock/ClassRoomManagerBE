const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/studentAuthController");
const studentController = require("../controllers/studentController");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

router.post(
  "/setup-account/:verificationToken",
  validateMiddleware(["name", "phoneNumber", "password"]),
  studentController.setupAccount
);
router.post(
  "/login-email",
  validateMiddleware(["email", "password"]),
  studentAuthController.loginEmail
);
router.post(
  "/validate-code",
  validateMiddleware(["email", "accessCode"]),
  studentAuthController.validateAccessCode
);
router.put(
  "/edit-profile",
  authMiddleware,
  validateMiddleware(["name", "email", "phoneNumber"]),
  studentAuthController.editProfile
);

router.get("/instructors", authMiddleware, authController.getAllInstructors);

module.exports = router;
