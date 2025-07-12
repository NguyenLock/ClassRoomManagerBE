const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/studentAuthController");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/login-email",
  validateMiddleware(["email"]),
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

module.exports = router;
