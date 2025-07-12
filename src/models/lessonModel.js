const db = require("../config/firebase");

exports.CheckStudentByEmail = async (email) => {
  try {
    const studensRef = db.collection("students");
    const studentQuery = await studensRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }
    return studentQuery.docs[0].data();
  } catch (error) {
    throw error;
  }
};
exports.getLessonsByStudentPhone = async (phoneNumber) => {
  const studentDoc = await db.collection("students").doc(phoneNumber).get();
  try {
    if (!studentDoc.exists) {
      throw new Error("Student not found");
    }
    const studentData = studentDoc.data();
    if (!studentData.lessons) {
      return [];
    }
    return studentData.lessons;
  } catch (error) {
    throw error;
  }
};
