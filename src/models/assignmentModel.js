const db = require("../config/firebase");

exports.createAssignment = async (assignment) => {
    const assignmentsRef  = db.collection("assignments");
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
exports.getAssignments = async () => {
    const assignmentsRef = db.collection("assignments");
    const snapshot = await assignmentsRef.where("lessonId", "==", lessonId).get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
};