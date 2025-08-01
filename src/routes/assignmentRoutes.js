const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware, roleMiddleware("instructor"));

router.post("/createAssignment", assignmentController.createAssignment);

module.exports = router;