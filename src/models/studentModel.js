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
      tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: false,
      accountSetup: false,
      lessons: [],
      createdAt: new Date().toISOString(),
      name: null,
      phoneNumber: null,
      password: null,
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
    const studentQuery = await studentsCollection
      .where("verificationToken", "==", verificationToken)
      .get();

    if (studentQuery.empty) {
      throw new Error("Invalid verification token");
    }

    const studentDoc = studentQuery.docs[0];
    const student = studentDoc.data();

    await studentsCollection.doc(studentDoc.id).update({
      name: name,
      phoneNumber: phoneNumber,
      password: password,
      accountSetup: true,
      isVerified: true,
      updatedAt: new Date().toISOString(),
    });

    return {
      email: student.email,
      name: name,
      phoneNumber: phoneNumber,
      isVerified: true,
      accountSetup: true,
    };
  } catch (error) {
    throw error;
  }
};
exports.assignLesson = async ({ studentPhone, lessonId }) => {
  try {
    let formattedPhone = studentPhone.replace(/\s+/g, "");

    const lessonsRef = db.collection("lessons");
    const lessonDoc = await lessonsRef.doc(lessonId).get();

    if (!lessonDoc.exists) {
      throw new Error("Lesson not found");
    }

    const lessonData = lessonDoc.data();

    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef
      .where("phoneNumber", "==", formattedPhone)
      .get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    const lessons = studentData.lessons || [];

    const existingLesson = lessons.find(
      (lesson) => lesson.lessonId === lessonId
    );
    if (existingLesson) {
      throw new Error("Lesson already assigned to this student");
    }

    const assignmentsRef = db.collection("assignments");
    const assignmentsQuery = await assignmentsRef.where("lessonId", "==", lessonId).get();
    const hasAssignments = !assignmentsQuery.empty;
    
    const initialStatus = hasAssignments ? "pending" : "waiting";

    lessons.push({
      lessonId,
      title: lessonData.title,
      description: lessonData.description,
      assignedAt: new Date().toISOString(),
      status: initialStatus,
    });

    await studentsRef.doc(studentDoc.id).update({ lessons });
    return lessons;
  } catch (error) {
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
        accountSetup: StudentData.accountSetup,
        createdAt: StudentData.createdAt,
      };
    });
  } catch (error) {
    throw error;
  }
};
exports.getStudentByEmail = async ({ email }) => {
  try {
    const studentRef = db.collection("students");
    const studentQuery = await studentRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      return null;
    }

    return studentQuery.docs[0].data();
  } catch (error) {
    throw error;
  }
};
exports.editStudentByEmail = async ({ email, updateData }) => {
  try {
    const studentRef = db.collection("students");
    const studentQuery = await studentRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentDoc = studentQuery.docs[0];
    const currentStudentData = studentDoc.data();

    if (updateData.email && updateData.email !== email) {
      const newEmailQuery = await studentRef
        .where("email", "==", updateData.email)
        .get();
      if (!newEmailQuery.empty) {
        throw new Error("Email already exists");
      }
    }

    const updatedData = {
      ...currentStudentData,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await studentRef.doc(studentDoc.id).update(updatedData);
    return updatedData;
  } catch (error) {
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
exports.deleteStudentByEmail = async ({ email }) => {
  try {
    const studentRef = db.collection("students");
    const studentQuery = await studentRef.where("email", "==", email).get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentDoc = studentQuery.docs[0];
    await studentRef.doc(studentDoc.id).delete();
  } catch (error) {
    throw error;
  }
};

exports.updateLessonStatusForAllStudents = async (lessonId) => {
  try {
    const lessonsRef = db.collection("lessons");
    const lessonDoc = await lessonsRef.doc(lessonId).get();
    
    if (!lessonDoc.exists) {
      throw new Error("Lesson not found");
    }
    
    const lessonData = lessonDoc.data();
    
    const assignmentsRef = db.collection("assignments");
    const assignmentsQuery = await assignmentsRef.where("lessonId", "==", lessonId).get();
    const hasAssignments = !assignmentsQuery.empty;
    
    const newStatus = hasAssignments ? "pending" : "waiting";
    
    const studentsRef = db.collection("students");
    const studentsSnapshot = await studentsRef.get();
    
    const updatePromises = [];
    
    studentsSnapshot.docs.forEach((studentDoc) => {
      const studentData = studentDoc.data();
      const lessons = studentData.lessons || [];
      
      const lessonIndex = lessons.findIndex(lesson => lesson.lessonId === lessonId);
      
      if (lessonIndex !== -1) {
        if (lessons[lessonIndex].status !== "completed" && lessons[lessonIndex].status !== newStatus) {
          lessons[lessonIndex].status = newStatus;
          lessons[lessonIndex].updatedAt = new Date().toISOString();
          
          updatePromises.push(
            studentsRef.doc(studentDoc.id).update({ lessons })
          );
        }
      }
    });
    
    await Promise.all(updatePromises);
    return { updated: updatePromises.length };
  } catch (error) {
    throw error;
  }
};
