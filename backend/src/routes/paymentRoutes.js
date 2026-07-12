const express = require('express');
const { checkout, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { validateCheckout, validateVerifyPayment } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', validateCheckout, checkout);
router.post('/verify', validateVerifyPayment, verifyPayment);

module.exports = router;
