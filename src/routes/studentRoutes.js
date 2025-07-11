const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.use(authMiddleware, roleMiddleware("instructor"));

router.post(
  "/addStudent",
  validateMiddleware(["name", "phoneNumber", "email"]),
  studentController.addStudent
);
router.post(
  "/assignLesson",
  validateMiddleware(["studentPhone", "title", "description"]),
  studentController.assignLesson
)
module.exports = router
