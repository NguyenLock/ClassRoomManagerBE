const studentModel = require("../models/studentModel");
const { v4: uuidv4 } = require("uuid");

exports.addStudent = async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;
    if (!name || !phoneNumber || !email) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const studentInfo = await studentModel.addStudent({
      name,
      phoneNumber,
      email,
    });
    res.status(201).json({
      message: "Student added successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error adding student", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.assignLesson = async (req, res) => {
  try {
    const { studentPhone, title, description } = req.body;
    if (!studentPhone || !title || !description) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const lessonId = uuidv4();
    const lessons = await studentModel.assignLesson({
      studentPhone,
      title,
      description,
      lessonId,
    });
    res.status(201).json({
      message: "Lesson assigned successfully",
      success: true,
      lessons,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        error: error.message,
      });
    }
    console.error("Error assigning lesson", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.getAllStudents = async (req, res) => {
  try {
    const students = await studentModel.getAllStudents();
    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.getStudentByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const student = await studentModel.getStudentByPhone({ phoneNumber });
    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }
    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.editStudentByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const updateData = req.body;
    const updatedStudent = await studentModel.editStudentByPhone({
      phoneNumber,
      updateData,
    });
    res.json({
      message: "Student updated successfully",
      success: true,
      updatedStudent,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        error: error.message,
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.deleteStudentByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    await studentModel.deleteStudentByPhone({ phoneNumber });
    res.json({
      message: "Student deleted successfully",
      success: true,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        error: error.message,
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
