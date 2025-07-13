const studentModel = require("../models/studentModel");
const { v4: uuidv4 } = require("uuid");
const { sendVerificationEmail } = require("../config/email");
const { hashPassword } = require("../utils/passwordHash");

exports.addStudent = async (req, res) => {
  try{
    const {email} = req.body;
    if(!email){
      return res.status(400).json({
        error: "Email is required",
      });
    }
    const verificationToken = uuidv4();

    const studentInfo = await studentModel.addStudent({
      email,
      verificationToken,
    })
    try{
      await sendVerificationEmail({
        email,
        verificationToken,
        verificationLink: `${process.env.FRONTEND_URL}/setup-account/${verificationToken}`,
      });
    } catch(error){
      console.error("Error sending verification email", error);
      await studentModel.deleteStudentByToken({verificationToken});
      return res.status(500).json({
        error: "Failed to send verification email",
      });
    }
    res.status(201).json({
      message: "Verification email sent successfully",

    });
  }catch(error){
    if(error.message === "Email already exists"){
      return res.status(400).json({
        error: error.message,
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
    })
  }
};

exports.setupAccount = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const { name, phoneNumber, password } = req.body;

    console.log("Setup account request:", { verificationToken, name, phoneNumber });

    if (!name || !phoneNumber || !password) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const student = await studentModel.findByVerificationToken({ verificationToken });
    console.log("Found student:", student);

    if (!student) {
      return res.status(404).json({
        error: "Invalid verification token",
      });
    }

    if (new Date() > new Date(student.tokenExpiry)) {
      return res.status(400).json({
        error: "Verification token expired",
      });
    }

    const hashedPassword = await hashPassword(password);

    const updatedStudent = await studentModel.setupAccount({
      verificationToken,
      name,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Account setup successfully",
      success: true
    });

  } catch (error) {
    console.error("Setup account error:", error);

    if (error.message === "Account already setup") {
      return res.status(400).json({
        error: error.message,
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
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
