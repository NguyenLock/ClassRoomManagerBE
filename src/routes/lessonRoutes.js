const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get("/mylessons", lessonController.getMyLessons);

module.exports = router;