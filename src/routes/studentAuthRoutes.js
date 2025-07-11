const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/studentAuthController");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.post(
  "/login-email",
  validateMiddleware(["email"]),
  studentAuthController.loginEmail
);
router.post("/validate-code", validateMiddleware(["email", "accessCode"]), studentAuthController.validateAccessCode);

module.exports = router;