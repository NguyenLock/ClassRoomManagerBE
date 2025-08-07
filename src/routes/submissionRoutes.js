const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');


//student
router.post('/submit', 
  authMiddleware,
  roleMiddleware("student"),
  submissionController.submitAssignment
);
router.get('/student/:assignmentId', 
  authMiddleware,
  roleMiddleware("student"),
  submissionController.getStudentSubmission
);

router.get('/student', 
  authMiddleware,
  roleMiddleware("student"),
  submissionController.getStudentSubmission
);
router.delete("/:submissionId",
  authMiddleware,
  roleMiddleware("student"),
  submissionController.deleteSubmission
);
//Instructor for getting submissions by assignment
router.get("/assignment/:assignmentId", 
  authMiddleware,
  roleMiddleware("instructor"),
  submissionController.getSubmissionByAssignment
);

router.put("/grade/:submissionId",  
  authMiddleware,
  roleMiddleware("instructor"),
  submissionController.gradeSubmission
);

module.exports = router;