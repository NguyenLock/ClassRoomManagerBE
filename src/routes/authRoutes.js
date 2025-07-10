const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/create-access-code', authController.createAccessCode);
router.post('/verify-access-code', authController.verifyAccessCode);

module.exports = router;