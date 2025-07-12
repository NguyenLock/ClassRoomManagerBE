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
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
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
      data: {
        lessons: lessons,
      },
    });
  } catch (error) {
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
