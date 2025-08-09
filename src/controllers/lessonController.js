const lessonModel = require("../models/lessonModel");
const assignmentModel = require("../models/assignmentModel");
const submissionModel = require("../models/submissionModel");
const { v4: uuidv4 } = require("uuid");

exports.getMyLessons = async (req, res) => {
  try {
    let { phoneNumber, includeProgress } = req.query;
    if (!phoneNumber) {
      return res.status(400).json({
        error: "Phone number is required",
      });
    }

    phoneNumber = phoneNumber.replace(/\s+/g, "");
    if (phoneNumber.startsWith("+84")) {
      phoneNumber = "0" + phoneNumber.substring(3);
    } else if (!phoneNumber.startsWith("0")) {
      phoneNumber = "0" + phoneNumber;
    }

    if (req.user.userType !== "student") {
      return res.status(403).json({
        error: "Access denied. Student only.",
      });
    }

    const studentData = await lessonModel.CheckStudentByEmail(req.user.email);

    if (studentData.phoneNumber !== phoneNumber) {
      return res.status(403).json({
        error: "You can only view your own lessons",
      });
    }

    const lessons = await lessonModel.getLessonsByStudentPhone(phoneNumber);

    if (includeProgress === 'true') {
      for (const lesson of lessons) {
        try {
          const assignmentsResult = await assignmentModel.getAssignmentsByLesson(lesson.lessonId, { page: 1, pageSize: 1000 });
          const assignments = assignmentsResult.assignments || [];
          
          let totalAssignments = assignments.length;
          let completedAssignments = 0;
          let totalScore = 0;
          let maxPossibleScore = 0;

          for (const assignment of assignments) {
            maxPossibleScore += assignment.maxScore || 0;
            
            const submission = await submissionModel.getSubmissionByAssignmentAndStudent(
              assignment.id,
              studentData.email || studentData.phoneNumber
            );

            if (submission) {
              if (submission.score !== null && submission.score !== undefined) {
                completedAssignments++;
                totalScore += submission.score;
              }
            }
          }

          const progressPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
          const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

          lesson.progress = {
            totalAssignments,
            completedAssignments,
            progressPercentage,
            totalScore,
            maxPossibleScore,
            scorePercentage,
            isCompleted: lesson.status === "completed"
          };

        } catch (error) {
          console.error(`Error calculating progress for lesson ${lesson.lessonId}:`, error);
          lesson.progress = {
            totalAssignments: 0,
            completedAssignments: 0,
            progressPercentage: 0,
            totalScore: 0,
            maxPossibleScore: 0,
            scorePercentage: 0,
            isCompleted: lesson.status === "completed"
          };
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        lessons: lessons,
      },
    });
  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        error: error.message,
      });
    }
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
exports.markLessonDone = async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({
        error: "LessonId is required",
      });
    }
    
    if (req.user.userType !== "student") {
      return res.status(403).json({
        error: "Access denied. Student only.",
      });
    }
  
    const studentData = await lessonModel.CheckStudentByEmail(req.user.email);

    const studentLessons = studentData.lessons || [];

    const lessonToMark = studentLessons.find(
      (lesson) => lesson.lessonId === lessonId
    );
    
    if (!lessonToMark) {
      return res.status(403).json({
        success: false,
        error: "You can only mark your own lessons as completed",
      });
    }

    if (lessonToMark.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "This lesson is already completed",
      });
    }

    const assignmentsResult = await assignmentModel.getAssignmentsByLesson(lessonId, { page: 1, pageSize: 1000 });
    const assignments = assignmentsResult.assignments;

    if (assignments.length > 0) {
      for (const assignment of assignments) {
        const submission = await submissionModel.getSubmissionByAssignmentAndStudent(
          assignment.id,
          studentData.email || studentData.phoneNumber
        );

        if (!submission) {
          return res.status(400).json({
            success: false,
            error: `Assignment "${assignment.title}". Please submit your assignment before marking the lesson as completed.`,
          });
        }

        if (submission.score === null || submission.score === undefined) {
          return res.status(400).json({
            success: false,
            error: `Assignment "${assignment.title}" has not been graded. Please wait for the instructor to grade all assignments before marking the lesson as completed.`,
          });
        }
      }
    }
    
    const updatedLessons = await lessonModel.markLessonAsCompleted(
      studentData.phoneNumber,
      lessonId
    );

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      data: {
        lessons: updatedLessons,
      },
    });
  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    if (error.message === "Lesson not found") {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    if (error.message === "Assignment not found") {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    if (error.message === "Submission not found") {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    console.error("Error in markLessonDone:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
    }

    const lessonId = uuidv4();

    const lesson = await lessonModel.createLesson({
      title,
      description,
      lessonId,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    if (error.message === "Lesson ID already exists") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { includeAssignments, includeSubmissions } = req.query;
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        error: "Lesson ID is required",
      });
    }

    const lesson = await lessonModel.getLessonById(lessonId);
    if(includeAssignments === "true"){
      try{
        const assignmentsResult = await assignmentModel.getAssignmentsByLesson(lessonId, { page: 1, pageSize: 1000 });
        lesson.assignments = assignmentsResult.assignments || [];
        if (includeSubmissions === "true") {
          for (const assignment of lesson.assignments) {
            try{
              const submissionResult = await submissionModel.getSubmissionsByAssignment(assignment.id);
              assignment.submission = submissionResult || null;
            } catch (error) {
              console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
              assignment.submission = [];
            }
          }
        }
      }catch (error) {
        console.error("Error fetching assignments:", error);
        return res.status(500).json({
          success: false,
          error: "Internal Server Error while fetching assignments",
        });
      }
    }

    return res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    if (error.message === "Lesson not found") {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await lessonModel.getAllLessons();

    return res.status(200).json({
      success: true,
      total: lessons.length,
      lessons,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.getLessonDetailForStudent = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user.email || req.user.phoneNumber;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        error: "Lesson ID is required",
      });
    }

    const studentData = await lessonModel.CheckStudentByEmail(req.user.email);
    const studentLessons = studentData.lessons || [];
    
    const assignedLesson = studentLessons.find(
      (lesson) => lesson.lessonId === lessonId
    );

    if (!assignedLesson) {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this lesson",
      });
    }

    const lesson = await lessonModel.getLessonById(lessonId);
    
    const assignmentsResult = await assignmentModel.getAssignmentsByLesson(lessonId, { page: 1, pageSize: 1000 });
    const assignments = assignmentsResult.assignments || [];

    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (assignment) => {
        try {
          const submission = await submissionModel.getSubmissionByAssignmentAndStudent(
            assignment.id,
            studentId
          );

          return {
            ...assignment,
            submission: submission || null,
            hasSubmitted: !!submission,
            isGraded: submission ? (submission.score !== null && submission.score !== undefined) : false,
            isLate: submission ? submission.status === "late" : false,
            isPastDeadline: new Date() > new Date(assignment.deadline)
          };
        } catch (error) {
          console.error(`Error fetching submission for assignment ${assignment.id}:`, error);
          return {
            ...assignment,
            submission: null,
            hasSubmitted: false,
            isGraded: false,
            isLate: false,
            isPastDeadline: new Date() > new Date(assignment.deadline)
          };
        }
      })
    );

    const totalAssignments = assignments.length;
    const submittedAssignments = assignmentsWithSubmissions.filter(a => a.hasSubmitted).length;
    const gradedAssignments = assignmentsWithSubmissions.filter(a => a.isGraded).length;
    const totalScore = assignmentsWithSubmissions
      .filter(a => a.isGraded)
      .reduce((sum, a) => sum + (a.submission?.score || 0), 0);
    const maxPossibleScore = assignmentsWithSubmissions
      .filter(a => a.isGraded)
      .reduce((sum, a) => sum + (a.maxScore || 0), 0);

    const lessonDetail = {
      ...lesson,
      ...assignedLesson, 
      assignments: assignmentsWithSubmissions,
      progress: {
        totalAssignments,
        submittedAssignments,
        gradedAssignments,
        pendingGrade: submittedAssignments - gradedAssignments,
        submissionProgress: totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
        gradingProgress: submittedAssignments > 0 ? Math.round((gradedAssignments / submittedAssignments) * 100) : 0,
        totalScore,
        maxPossibleScore,
        averageScore: gradedAssignments > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0,
        canMarkAsCompleted: totalAssignments > 0 ? gradedAssignments === totalAssignments : true
      }
    };

    return res.status(200).json({
      success: true,
      lesson: lessonDetail,
    });

  } catch (error) {
    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    if (error.message === "Lesson not found") {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    console.error("Error in getLessonDetailForStudent:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
