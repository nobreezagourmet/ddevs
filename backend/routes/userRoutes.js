const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/userController');
const { getMyNumbers } = require('../controllers/userQuotaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/my-numbers', protect, getMyNumbers);

module.exports = router;