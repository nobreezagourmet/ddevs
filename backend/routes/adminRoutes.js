const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { swapQuota, createRaffle } = require('../controllers/adminController');

router.post('/swap-quota', protect, admin, swapQuota);
router.post('/create-raffle', protect, admin, createRaffle);

module.exports = router;