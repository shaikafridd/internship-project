const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// Seed / bootstrap: create the default admin
// if one doesn't already exist.
// Called once on server startup from app.js.
// ─────────────────────────────────────────────
const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: 'admin' });
    if (!existing) {
      await Admin.create({ username: 'admin', password: 'admin' });
      console.log('✅ Default admin user created (username: admin)');
    }
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message);
  }
};

// Helper: sign JWT
const signToken = (id) => {
  // NOTE: Make sure JWT_SECRET is set in backend/.env
  // Example: JWT_SECRET=your_super_secret_key_here
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// ─────────────────────────────────────────────
// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
// ─────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Look up admin (include password field explicitly)
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    // Compare submitted password against stored hash
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const token = signToken(admin._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin login',
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Protected admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Admin (requires verifyAdminToken middleware)
// ─────────────────────────────────────────────
exports.adminDashboard = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    // req.admin is set by verifyAdminToken middleware
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data loaded successfully',
      data: {
        adminId: req.admin.id,
        username: req.admin.username,
        role: 'admin',
        stats: {
          totalStudents: 12845,
          activeCourses: 5,
          totalEnrollments: 25671,
          totalRevenue: 1886995,
          pendingPayouts: 245300,
        },
        serverInfo: {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 5000,
          dbStatus: mongoose.connection.readyState === 1 ? 'Connected (Atlas DB)' : 'Disconnected',
          platform: process.platform,
          memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`
        },
        serverStatus: 'operational',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    });
  }
};

// Course CRUD Operations for Admin
exports.getCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find();
    const formatted = courses.map(c => ({
      id: c._id,
      name: c.title,
      instructor: c.instructor,
      students: '0',
      price: `₹${c.price.toLocaleString('en-IN')}`,
      status: 'Published',
      sections: c.sections || [],
      description: c.description || '',
      category: c.category || 'Development'
    }));
    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, instructor, price, description, category, sections } = req.body;
    const cleanPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, ''), 10) : price;

    const course = await Course.create({
      title: name,
      instructor: instructor || 'Admin',
      price: cleanPrice || 0,
      description: description || 'Course created by administrator via dashboard.',
      category: category || 'Development',
      image: 'default_course.png',
      duration: '10h 00m',
      lessonsCount: 10,
      sections: sections || []
    });

    return res.status(201).json({
      success: true,
      data: {
        id: course._id,
        name: course.title,
        instructor: course.instructor,
        students: '0',
        price: `₹${course.price.toLocaleString('en-IN')}`,
        status: 'Published',
        sections: course.sections,
        description: course.description,
        category: course.category
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { name, instructor, price, sections, description, category } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (name) course.title = name;
    if (instructor) course.instructor = instructor;
    if (price !== undefined) {
      course.price = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, ''), 10) : price;
    }
    if (sections !== undefined) course.sections = sections;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;

    await course.save();

    return res.status(200).json({
      success: true,
      data: {
        id: course._id,
        name: course.title,
        instructor: course.instructor,
        students: '0',
        price: `₹${course.price.toLocaleString('en-IN')}`,
        status: 'Published',
        sections: course.sections,
        description: course.description,
        category: course.category
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await course.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Payment CRUD Operations for Admin
exports.getPaymentsAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .populate('course', 'title');

    const formatted = orders.map((o) => ({
      id: o._id,
      student: o.user?.name || 'Unknown Student',
      course: o.course?.title || 'Unknown Course',
      amount: `₹${o.totalAmount.toLocaleString('en-IN')}`,
      status: o.status === 'Completed' ? 'Paid' : o.status,
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePaymentStatusAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (req.body.status !== undefined) {
      order.status = req.body.status;
    } else {
      order.status = order.status === 'Completed' ? 'Pending' : 'Completed';
    }

    if (req.body.amount !== undefined) {
      order.totalAmount = req.body.amount;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deletePaymentAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    return res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        location: u.location || 'N/A',
        phone: u.phone || 'N/A',
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadVideoAdmin = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
      });
    }

    const fs = require('fs');
    const path = require('path');
    const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    if (isCloudinaryConfigured) {
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video',
              folder: 'careerhub_videos',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadStream();
      return res.status(200).json({
        success: true,
        message: 'Video uploaded to Cloudinary successfully',
        data: {
          url: result.secure_url,
          name: fileName,
          size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      });
    } else {
      const publicUploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(fileName) || '.mp4';
      const cleanFileName = uniqueSuffix + ext;
      const filePath = path.join(publicUploadsDir, cleanFileName);

      fs.writeFileSync(filePath, req.file.buffer);

      const absoluteUrl = `${req.protocol}://${req.get('host')}/uploads/${cleanFileName}`;

      return res.status(200).json({
        success: true,
        message: 'Video uploaded locally successfully (Cloudinary config missing)',
        data: {
          url: absoluteUrl,
          name: fileName,
          size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.seedAdmin = seedAdmin;
