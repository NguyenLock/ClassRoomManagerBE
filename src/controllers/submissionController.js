const submissionModel = require("../models/submissionModel");
const assignmentModel = require("../models/assignmentModel");

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content, attachments } = req.body;
    const studentId = req.user.email || req.user.phoneNumber;

    if (!assignmentId || !content) {
      return res
        .status(400)
        .json({ error: "Assignment ID and content are required." });
    }
    const assignment = await assignmentModel.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    const deadline = new Date(assignment.deadline);
    const now = new Date();
    const isLate = now > deadline;

    const existingSubmission =
      await submissionModel.getSubmissionByAssignmentAndStudent(
        assignmentId,
        studentId
      );
    if (existingSubmission) {
      const updateData = {
        content,
        attachments: attachments || [],
        submittedAt: new Date().toISOString(),
        status: isLate ? "late" : "submitted",
      };
      const updatedSubmission = await submissionModel.updateSubmission(
        existingSubmission.id,
        updateData
      );
      return res.status(200).json({
        success: true,
        message: "Submission updated successfully.",
        submission: updatedSubmission,
        isLate,
      });
    }
    const submissionData = {
      assignmentId,
      studentId,
      content,
      attachments: attachments || [],
    };
    const submission = await submissionModel.createSubmission(submissionData);
    if (isLate) {
      await submissionModel.updateSubmission(submission.id, { status: "late" });
      submission.status = "late";
    }
    return res.status(201).json({
      success: true,
      message: "Submission created successfully.",
      submission,
      isLate,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while submitting the assignment." });
  }
};

exports.getStudentSubmission = async (req, res) => {
  try {
    const studentId = req.user.email || req.user.phoneNumber;
    const { assignmentId } = req.params;
    if (assignmentId) {
      const submission =
        await submissionModel.getSubmissionByAssignmentAndStudent(
          assignmentId,
          studentId
        );
      if (!submission) {
        return res.status(404).json({ error: "Submission not found." });
      }
      return res.status(200).json({ success: true, submission });
    }
    res.status(200).json({ success: true, submissions: [] });
  } catch (error) {
    console.error("Error fetching student submission:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the submission." });
  }
};
exports.getSubmissionByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(limit);

    if (pageNum < 1 || pageSizeNum < 1 || pageSizeNum > 100) {
      return res
        .status(400)
        .json({ error: "Invalid page or limit parameters." });
    }
    const opdations = {
      page: pageNum,
      limit: pageSizeNum,
    };
    const result = await submissionModel.getSubmissionsByAssignment(
      assignmentId,
      opdations
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
    try{
        const { submissionId } = req.params;
        const { score, feedback } = req.body;
        const instructorId = req.user.email || req.user.phoneNumber;
        
        if(score === undefined){
            return res.status(400).json({ error: "Score is required." });
        }
        const updateData = {
            score,
            feedback: feedback || "",
            status: "graded",
            gradedAt: new Date().toISOString(),
            gradedBy: instructorId,
        };
        const updatedSubmission = await submissionModel.updateSubmission(
            submissionId,
            updateData
        );
        return res.status(200).json({
            success: true,
            message: "Submission graded successfully.",
            submission: updatedSubmission,
        });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
};
