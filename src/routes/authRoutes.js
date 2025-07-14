const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create-access-code', authController.createAccessCode);
router.post('/verify-access-code', authController.verifyAccessCode);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;