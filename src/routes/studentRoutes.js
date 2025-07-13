const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.use(authMiddleware, roleMiddleware("instructor"));

router.post(
  "/addStudent",
  validateMiddleware(["email"]),
  studentController.addStudent
);
router.post(
  "/assignLesson",
  validateMiddleware(["studentPhone", "title", "description"]),
  studentController.assignLesson
)
router.get("/getAllStudents", studentController.getAllStudents);
router.get("/getStudentByEmail/:email", studentController.getStudentByEmail);
router.put("/editStudentByEmail/:email", studentController.editStudentByEmail);
router.delete("/deleteStudentByEmail/:email", studentController.deleteStudentByEmail);

module.exports = router
