const lessonModel = require("../models/lessonModel");

exports.getMyLessons = async (req, res) => {
  try {
    let { phoneNumber } = req.query;
    if (!phoneNumber) {
      return res.status(400).json({
        error: "Phone number is required",
      });
    }

    phoneNumber = phoneNumber.replace(/\s+/g, "");
    if (phoneNumber.startsWith("+84")) {
      phoneNumber = "0" + phoneNumber.substring(3);
    } else if (!phoneNumber.startsWith("0")) {
      phoneNumber = "0" + phoneNumber;
    }

    if (req.user.userType !== "student") {
      return res.status(403).json({
        error: "Access denied. Student only.",
      });
    }

    const studentData = await lessonModel.CheckStudentByEmail(req.user.email);

    if (studentData.phoneNumber !== phoneNumber) {
      return res.status(403).json({
        error: "You can only view your own lessons",
      });
    }

    const lessons = await lessonModel.getLessonsByStudentPhone(phoneNumber);
    return res.status(200).json({
      success: true,
      data: {
        lessons: lessons,
      },
    });
  } catch (error) {
    console.error("Error in getMyLessons:", error);
    if (error.message === "Student not found") {
      return res.status(404).json({
        error: error.message,
      });
    }
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.markLessonDone = async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({
        error: "LessonId is required",
      });
    }

    if (req.user.userType !== "student") {
      return res.status(403).json({
        error: "Access denied. Student only.",
      });
    }

    const studentData = await lessonModel.CheckStudentByEmail(req.user.email);

    const studentLessons = studentData.lessons || [];

    const lessonToMark = studentLessons.find(
      (lesson) => lesson.lessonId === lessonId
    );

    if (!lessonToMark) {
      return res.status(403).json({
        success: false,
        error: "You can only mark your own lessons as completed",
      });
    }

    if (lessonToMark.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "This lesson is already completed",
      });
    }

    const updatedLessons = await lessonModel.markLessonAsCompleted(
      studentData.phoneNumber,
      lessonId
    );

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      data: {
        lessons: updatedLessons,
      },
    });
  } catch (error) {
    console.error("Detailed error in markLessonDone:", {
      message: error.message,
      stack: error.stack,
      error,
    });

    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    if (error.message === "Lesson not found") {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
