const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, handleWebhook } = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/webhook', handleWebhook);

module.exports = router;