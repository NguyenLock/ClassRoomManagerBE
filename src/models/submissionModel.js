const db = require("../config/firebase");

exports.createSubmission = async (submissionData) => {
  const submissionsRef = db.collection("submissions");
  const { assignmentId, studentId, content, attachments } = submissionData;

  const submission = {
    assignmentId,
    studentId,
    content,
    attachments: attachments || [],
    submittedAt: new Date().toISOString(),
    status: "submitted",
    score: null,
    feedback: null,
    gradedAt: null,
    gradedBy: null,
  };
  const docRef = await submissionsRef.add(submission);
  return { id: docRef.id, ...submission };
};
exports.getSubmissionByAssignmentAndStudent = async (
  assignmentId,
  studentId
) => {
  const submissionsRef = db.collection("submissions");
  const snapshot = await submissionsRef
    .where("assignmentId", "==", assignmentId)
    .where("studentId", "==", studentId)
    .get();

  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};
exports.updateSubmission = async (submissionId, updateData) =>{
    const submissionRef = db.collection("submissions").doc(submissionId);
    const doc = await submissionRef.get();

    if(!doc.exists) {
        throw new Error("Submission not found");
    }
    const updatedData ={
        ...updateData,
        updatedAt: new Date().toISOString()  
    };
    await submissionRef.update(updatedData);
    const updatedDoc = await submissionRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
};

exports.getSubmissionsByAssignment = async (assignmentId, options = {}) => {
    const {page = 1, limit = 10} = options;
    let query = db.collection("submissions").where("assignmentId", "==", assignmentId);

    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);

    const paginatedSnapshot = await paginatedQuery.get();
    const submissions = paginatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return {
        submissions,
        pagination: {
            currentPage: page,
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        }
    };
};
exports.getSubmissionsByStudent = async (studentId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  let query = db.collection("submissions").where("studentId", "==", studentId);

  const totalSnapshot = await query.get();
  const total = totalSnapshot.size;
  const offset = (page - 1) * limit;
  const paginatedQuery = query.offset(offset).limit(limit);

  const paginatedSnapshot = await paginatedQuery.get();
  const submissions = paginatedSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    submissions,
    pagination: {
      currentPage: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    }
  };
}

