const db = require("../config/firebase");

exports.createAssignment = async (assignment) => {
  const assignmentsRef = db.collection("assignments");
  const { title, description, lessonId, deadline, maxScore } = assignment;
  const assignmentData = {
    title,
    description,
    lessonId,
    deadline,
    maxScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await assignmentsRef.add(assignmentData);
  return { id: docRef.id, ...assignmentData };
};

exports.getAssignmentsByLesson = async (lessonId, options = {}) => {
  const { page = 1, pageSize = 10 } = options;

  let query = db.collection("assignments").where("lessonId", "==", lessonId);

  const totalQuery = db
    .collection("assignments")
    .where("lessonId", "==", lessonId);
  const totalSnapshot = await totalQuery.get();
  const total = totalSnapshot.size;

  const offset = (page - 1) * pageSize;
  const paginatedQuery = query.offset(offset).limit(pageSize);

  const paginatedSnapshot = await paginatedQuery.get();
  const assignments = paginatedSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    assignments,
    pagination: {
      currentPage: page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrev: page > 1,
    },
  };
};

exports.getAssignmentById = async (assignmentId) => {
  const assignmentRef = db.collection("assignments").doc(assignmentId);
  const doc = await assignmentRef.get();

  if (!doc.exists) {
    throw new Error("Assignment not found");
  }

  return { id: doc.id, ...doc.data() };
};

exports.updateAssignment = async (assignmentId, updateData) => {
  const assignmentRef = db.collection("assignments").doc(assignmentId);

  const doc = await assignmentRef.get();
  if (!doc.exists) {
    throw new Error("Assignment not found");
  }

  const updatedData = {
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  await assignmentRef.update(updatedData);

  const updatedDoc = await assignmentRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

exports.deleteAssignment = async (assignmentId) => {
  const assignmentRef = db.collection("assignments").doc(assignmentId);

  const doc = await assignmentRef.get();
  if (!doc.exists) {
    throw new Error("Assignment not found");
  }

  const assignmentData = { id: doc.id, ...doc.data() };

  await assignmentRef.delete();

  return assignmentData;
};
