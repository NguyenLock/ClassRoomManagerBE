const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware, roleMiddleware("instructor"));

router.post("/createAssignment", assignmentController.createAssignment);
router.get("/lesson/:lessonId", assignmentController.getAssignmentsByLesson);
router.get("/:assignmentId", assignmentController.getAssignmentById);
router.put("/:assignmentId", assignmentController.updateAssignment);
router.delete("/:assignmentId", assignmentController.deleteAssignment);

module.exports = router;