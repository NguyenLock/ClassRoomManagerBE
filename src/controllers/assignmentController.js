const assignmentModel = require("../models/assignmentModel");

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, lessonId, deadline, maxScore } = req.body;
    if (!title || !description || !lessonId || !deadline || !maxScore) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const assignment = await assignmentModel.createAssignment({
      title,
      description,
      lessonId,
      deadline,
      maxScore,
    });
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      page = 1,
      pageSize = 10,
    } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    if (pageNum < 1 || pageSize < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        error: error.message,
      });
    }
    const options = {
      page: pageNum,
      pageSize: pageSizeNum,
    };
    const result = await assignmentModel.getAssignmentsByLesson(
      lessonId,
      options
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await assignmentModel.getAssignmentById(assignmentId);
    res.status(200).json({ success: true, assignment });
  } catch (error) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, deadline, maxScore } = req.body;

    if (!title && !description && !deadline && !maxScore) {
      return res.status(400).json({
        error:
          "At least one field (title, description, deadline, maxScore) is required to update",
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (deadline) updateData.deadline = deadline;
    if (maxScore) updateData.maxScore = maxScore;

    const updatedAssignment = await assignmentModel.updateAssignment(
      assignmentId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const deletedAssignment = await assignmentModel.deleteAssignment(
      assignmentId
    );

    try {
      await studentModel.updateLessonStatusForAllStudents(deletedAssignment.lessonId);
    } catch (error) {
      console.error("Error updating student lesson status after assignment deletion:", error);
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
      deletedAssignment,
    });
  } catch (error) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
