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
    const assignments = await assignmentModel.getAssignmentsByLesson(lessonId);
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
