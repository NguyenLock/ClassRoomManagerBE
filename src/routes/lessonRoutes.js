const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);
router.get("/mylessons", lessonController.getMyLessons);
router.post("/mark-done", lessonController.markLessonDone);
router.get("/:lessonId/detail", roleMiddleware("student"), lessonController.getLessonDetailForStudent);

module.exports = router;