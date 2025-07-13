const db = require("../config/firebase");

const studentsCollection = db.collection("students");

exports.addStudent = async ({ email, verificationToken }) => {
  try {
    const studentQuery = await studentsCollection
      .where("email", "==", email)
      .get();
    if (!studentQuery.empty) {
      throw new Error("Email already exists");
    }
    const studentInfo = {
      email: email,
      verificationToken: verificationToken,
      isVerified: false,
      accountSetup: false,
      lessons: [],
      createdAt: new Date().toISOString(),
      name: null,
      phoneNumber: null,
    };
    await studentsCollection.doc(verificationToken).set(studentInfo);
    return studentInfo;
  } catch (error) {
    throw error;
  }
};
exports.deleteStudentByToken = async ({ verificationToken }) => {
  try {
    const studentRef = studentsCollection.doc(verificationToken);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      throw new Error("Student not found");
    }
    await studentRef.delete();
  } catch (error) {
    console.error("Error deleting student", error);
    throw error;
  }
};
exports.findByVerificationToken = async ({ verificationToken }) => {
  try {
    const doc = await studentsCollection.doc(verificationToken).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (error) {
    throw error;
  }
};
exports.setupAccount = async ({
  verificationToken,
  name,
  phoneNumber,
  password,
}) => {
  try {
    const studentRef = studentsCollection.doc(verificationToken);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      throw new Error("Invalid verification token");
    }
    const studentData = studentDoc.data();
    if (studentData.accountSetup) {
      throw new Error("Account already setup");
    }
    const updatedData = {
      ...studentData,
      name: name,
      phoneNumber: phoneNumber,
      password: password,
      isVerified: true,
      accountSetup: true,
      verificationToken: null,
      updatedAt: new Date().toISOString(),
    };
    await studentsCollection.doc(verificationToken).update(updatedData);

    await studentRef.delete();
    return updatedData;
  } catch (error) {
    throw error;
  }
};
exports.assignLesson = async ({
  studentPhone,
  title,
  description,
  lessonId,
}) => {
  try {
    const studentRef = studentsCollection.doc(studentPhone);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      throw new Error("Student not found");
    }
    const studentData = studentDoc.data();
    const lessons = studentData.lessons || [];

    lessons.push({
      lessonId,
      title,
      description,
      assignedAt: new Date().toISOString(),
      status: "pending",
    });
    await studentRef.update({ lessons });
    return lessons;
  } catch (error) {
    console.error("Error assigning lesson", error);
    throw error;
  }
};
exports.getAllStudents = async () => {
  try {
    const getStudents = await studentsCollection.get();
    return getStudents.docs.map((doc) => {
      const StudentData = doc.data();
      return {
        name: StudentData.name,
        phoneNumber: StudentData.phoneNumber,
        email: StudentData.email,
      };
    });
  } catch (error) {
    console.error("Error getting all students", error);
    throw error;
  }
};
exports.getStudentByPhone = async ({ phoneNumber }) => {
  try {
    const doc = await studentsCollection.doc(phoneNumber).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (error) {
    throw error;
  }
};
exports.editStudentByPhone = async ({ phoneNumber, updateData }) => {
  try {
    const studentRef = studentsCollection.doc(phoneNumber);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      throw new Error("Student not found");
    }
    await studentRef.update(updateData);
    const updatedStudent = await studentRef.get();
    return updatedStudent.data();
  } catch (error) {
    console.error("Error editing student", error);
    throw error;
  }
};
exports.deleteStudentByPhone = async ({ phoneNumber }) => {
  try {
    const studentRef = studentsCollection.doc(phoneNumber);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      throw new Error("Student not found");
    }
    await studentRef.delete();
  } catch (error) {
    console.error("Error deleting student", error);
    throw error;
  }
};
exports.editStudentProfile = async ({ currentEmail, updateData }) => {
  try {
    const studentRef = db.collection("students");
    const currentStudent = await studentRef
      .where("email", "==", currentEmail)
      .get();

    if (currentStudent.empty) {
      throw new Error("Student not found");
    }
    const currentStudentDoc = currentStudent.docs[0];
    const currentStudentData = currentStudentDoc.data();

    if (updateData.email !== currentEmail) {
      const newEmailQuery = await studentRef
        .where("email", "==", updateData.email)
        .get();
      if (!newEmailQuery.empty) {
        throw new Error("Email already exists");
      }
    }
    const updatedData = {
      ...currentStudentData,
      name: updateData.name,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
      updatedAt: new Date().toISOString(),
    };
    await studentRef.doc(currentStudentDoc.id).update(updatedData);
    return updatedData;
  } catch (error) {
    throw error;
  }
};
