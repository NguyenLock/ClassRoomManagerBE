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
  try {
    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef
      .where("phoneNumber", "==", phoneNumber)
      .get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentData = studentQuery.docs[0].data();
    if (!studentData.lessons) {
      return [];
    }
    return studentData.lessons;
  } catch (error) {
    throw error;
  }
};
exports.markLessonAsCompleted = async (phoneNumber, lessonId) => {
  try {
    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef
      .where("phoneNumber", "==", phoneNumber)
      .get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    const lessons = studentData.lessons || [];

    const lessonIndex = lessons.findIndex(
      (lesson) => lesson.lessonId === lessonId
    );
    if (lessonIndex === -1) {
      throw new Error("Lesson not found");
    }

    lessons[lessonIndex] = {
      ...lessons[lessonIndex],
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    await studentsRef.doc(studentDoc.id).update({ lessons });
    return lessons;
  } catch (error) {
    throw error;
  }
};
exports.createLesson = async ({ title, description, lessonId }) => {
  try {
    const lessonsRef = db.collection("lessons");

    const existingLesson = await lessonsRef.doc(lessonId).get();
    if (existingLesson.exists) {
      throw new Error("Lesson ID already exists");
    }

    const lessonData = {
      lessonId,
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };

    await lessonsRef.doc(lessonId).set(lessonData);
    return lessonData;
  } catch (error) {
    throw error;
  }
};
exports.getLessonById = async (lessonId) => {
  try {
    const lessonsRef = db.collection("lessons");
    const lessonDoc = await lessonsRef.doc(lessonId).get();

    if (!lessonDoc.exists) {
      throw new Error("Lesson not found");
    }

    return lessonDoc.data();
  } catch (error) {
    throw error;
  }
};
exports.getAllLessons = async () => {
  try {
    const lessonsRef = db.collection("lessons");
    const studentsRef = db.collection("students");

    const lessonsSnapshot = await lessonsRef.get();
    if (lessonsSnapshot.empty) {
      return [];
    }

    const studentsSnapshot = await studentsRef.get();
    const students = studentsSnapshot.docs.map((doc) => doc.data());

    const lessons = await Promise.all(
      lessonsSnapshot.docs.map(async (doc) => {
        const lessonData = doc.data();

        let totalStudents = 0;
        let completedStudents = 0;

        students.forEach((student) => {
          if (student.lessons) {
            const lessonForStudent = student.lessons.find(
              (l) => l.lessonId === lessonData.lessonId
            );
            if (lessonForStudent) {
              totalStudents++;
              if (lessonForStudent.status === "completed") {
                completedStudents++;
              }
            }
          }
        });

        return {
          ...lessonData,
          id: doc.id,
          studentStats: {
            total: totalStudents,
            completed: completedStudents,
            inProgress: totalStudents - completedStudents,
          },
        };
      })
    );

    return lessons.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    throw error;
  }
};

exports.updateLessonStatusForStudent = async (phoneNumber, lessonId, newStatus) => {
  try {
    const studentsRef = db.collection("students");
    const studentQuery = await studentsRef
      .where("phoneNumber", "==", phoneNumber)
      .get();

    if (studentQuery.empty) {
      throw new Error("Student not found");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    const lessons = studentData.lessons || [];

    const lessonIndex = lessons.findIndex(
      (lesson) => lesson.lessonId === lessonId
    );
    
    if (lessonIndex === -1) {
      throw new Error("Lesson not found for this student");
    }

    if (lessons[lessonIndex].status === "completed") {
      return lessons;
    }

    lessons[lessonIndex] = {
      ...lessons[lessonIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await studentsRef.doc(studentDoc.id).update({ lessons });
    return lessons;
  } catch (error) {
    throw error;
  }
};
