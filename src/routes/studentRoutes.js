const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const lessonController = require("../controllers/lessonController");
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
  "/lesson/create",
  validateMiddleware(["title", "description"]),
  lessonController.createLesson
);

router.get("/lessons", lessonController.getAllLessons);
router.get("/lesson/:lessonId", lessonController.getLessonById);

router.post(
  "/assignLesson",
  validateMiddleware(["studentPhone", "lessonId"]),
  studentController.assignLesson
);

router.get("/getAllStudents", studentController.getAllStudents);
router.get("/getStudentByEmail/:email", studentController.getStudentByEmail);
router.put("/editStudentByEmail/:email", studentController.editStudentByEmail);
router.delete(
  "/deleteStudentByEmail/:email",
  studentController.deleteStudentByEmail
);

module.exports = router;
