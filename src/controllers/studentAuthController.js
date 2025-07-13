const db = require("../config/firebase");
const { accessCodeTransporter } = require("../config/email");
const generate6Code = require("../utils/generateCode");
const jwt = require("jsonwebtoken");
const studentModel = require('../models/studentModel');
const bcrypt = require('bcrypt');

exports.loginEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      return res.status(404).json({
        error: "Student Email not Found",
      });
    }
    const studentData = studentQuery.docs[0].data();
    if(!studentData.accountSetup|| !studentData.isVerified){ 
      return res.status(401).json({
        success: false,
        error: "Account not verified Please contact instructor to active account"
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, studentData.password);
    if(!isPasswordCorrect){
      return res.status(401).json({
        success: false,
        error: "Invalid password"
      });
    }

    const accessCode = generate6Code();

    await db.collection("accessCodes").doc(email).set({
      code: accessCode,
      createdAt: new Date().toISOString(),
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Access Code for Student Login",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ClassRoom App Login</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Here is your access code for login:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #2563eb;">
                ${accessCode}
              </div>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              This code will expire in 5 minutes. Do not share this code with anyone.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p style="font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ClassRoom App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await accessCodeTransporter.sendMail(mailOptions);

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
exports.editProfile = async (req, res) => {
  try{
    const {name, email, phoneNumber} = req.body;
    if(req.user.userType !== 'student'){
      return res.status(403).json({
        error: "Access denied. Student only."
      });
    }
    if(req.user.email !== email){
      return res.status(403).json({
        error: "You can only edit your own profile"
      });
    }
    if(!name || !email || !phoneNumber){
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const updatedDataStudent = await studentModel.editStudentProfile({
      currentEmail: req.user.email,
      updateData:{
        name,
        email,
        phoneNumber
      }
    });
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data:{
        user:{
          name: updatedDataStudent.name,
          email: updatedDataStudent.email,
          phoneNumber: updatedDataStudent.phoneNumber
        }
      }
    });
  }catch(error){
    if(error.message === 'Student not found'){
      return res.status(404).json({
        error: "Student not found"
      });
    }
    if(error.message === 'Email already exists'){
      return res.status(400).json({
        error: "Email already exists"
      });
    }
    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
}
