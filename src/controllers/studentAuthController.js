const db = require("../config/firebase");
const transporter = require("../config/email");
const generate6Code = require("../utils/generateCode");
const jwt = require("jsonwebtoken");

exports.loginEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      return res.status(404).json({
        error: "Student Email not Found",
      });
    }
    const studentData = studentQuery.docs[0].data();
    const accessCode = generate6Code();

    await db.collection("accessCodes").doc(email).set({
      code: accessCode,
      createdAt: new Date().toISOString(),
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Access Code for Student Login",
      text: `Your access Code is: ${accessCode}`,
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Access code sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to send access code",
    });
  }
};

exports.validateAccessCode = async (req, res) => {
  try {
    const { email, accessCode } = req.body;

    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      return res.status(404).json({
        success: false,
        error: "Student Email or Access Code Wrong",
      });
    }

    const studentData = studentQuery.docs[0].data();

    const docRef = db.collection("accessCodes").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "Access Code Wrong or expired",
      });
    }

    const data = doc.data();

    if (String(data.code) !== String(accessCode)) {
      return res.status(400).json({
        success: false,
        error: "Invalid access code",
      });
    }

    const codeCreatedAt = new Date(data.createdAt);
    const now = new Date();
    if (now - codeCreatedAt > 5 * 60 * 1000) {
      await docRef.delete();
      return res.status(400).json({
        success: false,
        error: "Access code has expired",
      });
    }

    await docRef.delete();

    const token = jwt.sign(
      {
        email: studentData.email,
        name: studentData.name,
        phoneNumber: studentData.phoneNumber,
        userType: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Access code validated successfully",
      data: {
        token,
        user: {
          email: studentData.email,
          name: studentData.name,
          phoneNumber: studentData.phoneNumber,
          userType: "student",
        },
      },
    });
  } catch (error) {
    console.error("Error in validateAccessCode:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to validate access code",
    });
  }
};
