const Order = require('../models/Order');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto');

// @desc    Initialize checkout order and calculate price
// @route   POST /api/payments/checkout
// @access  Private
exports.checkout = async (req, res, next) => {
  try {
    const { courseId, discountCode, paymentMethod } = req.body;

    // 1. Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const basePrice = course.price;
    let discountAmount = 0;

    // Apply WELCOME10 coupon (10% discount)
    if (discountCode && discountCode.toUpperCase() === 'WELCOME10') {
      discountAmount = Math.round(basePrice * 0.10 * 100) / 100;
    }

    const discountedPrice = basePrice - discountAmount;
    const gstRate = 0.18; // 18% GST
    const gstAmount = Math.round(discountedPrice * gstRate * 100) / 100;
    const totalAmount = Math.round((discountedPrice + gstAmount) * 100) / 100;

    // 2. Create pending Order
    const order = await Order.create({
      user: req.user.id,
      course: courseId,
      basePrice,
      discountCode: discountCode || '',
      discountAmount,
      gstAmount,
      totalAmount,
      paymentMethod,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        courseTitle: course.title,
        basePrice,
        discountCode: order.discountCode,
        discountAmount,
        gstAmount,
        totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mock verify payment & enroll user on success
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentStatus } = req.body;

    // Find Order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify it belongs to the logged-in user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment',
      });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order is already processed with status: ${order.status}`,
      });
    }

    if (paymentStatus === 'Completed') {
      // Update order status
      order.status = 'Completed';
      order.transactionId = 'ch_tx_' + crypto.randomBytes(8).toString('hex');
      await order.save();

      // Check if enrollment already exists (upsert logic to avoid duplicates)
      let enrollment = await Enrollment.findOne({
        user: order.user,
        course: order.course,
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          user: order.user,
          course: order.course,
          progress: 0,
          completedLessons: [],
          status: 'active',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified and enrollment created successfully',
        data: {
          orderId: order._id,
          transactionId: order.transactionId,
          status: order.status,
          enrollmentId: enrollment._id,
        },
      });
    } else {
      order.status = 'Failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: {
          orderId: order._id,
          status: order.status,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
