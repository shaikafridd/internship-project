const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Helper to seed in-memory DB with mockup data
const seedInMemoryDB = async () => {
  try {
    const Course = require('../models/Course');
    const User = require('../models/User');
    const Task = require('../models/Task');
    const JobApplication = require('../models/JobApplication');
    const SavedJob = require('../models/SavedJob');
    const Enrollment = require('../models/Enrollment');

    console.log('Seeding in-memory database with screenshot template data...');

    // 1. Seed Courses
    const coursesData = [
      {
        title: 'UI/UX Design Fundamentals',
        instructor: 'CareerHub',
        description: 'Learn the end-to-end design process, user research, wireframing, and interactive prototyping.',
        price: 1499,
        category: 'Design',
        image: 'uiux_mastercourse.png',
        duration: '12h 45m',
        lessonsCount: 26,
        sections: [
          {
            title: 'Section 1: Introduction to UI/UX',
            lessons: [
              { id: 's1l1', title: 'What is UI/UX Design?', duration: '08:15' },
              { id: 's1l2', title: 'Design Thinking Process', duration: '12:45' },
              { id: 's1l3', title: 'User Needs and Goals', duration: '10:20' },
              { id: 's1l4', title: 'UI vs UX: Key Differences', duration: '07:30' },
              { id: 's1l5', title: 'Career Opportunities in UI/UX', duration: '09:10' }
            ]
          },
          {
            title: 'Section 2: User Research',
            lessons: [
              { id: 's2l1', title: 'Introduction to User Research', duration: '06:45' },
              { id: 's2l2', title: 'Conducting User Interviews', duration: '15:20' }
            ]
          }
        ]
      },
      {
        title: 'Advanced JavaScript',
        instructor: 'John Doe',
        description: 'Master closures, prototypal inheritance, async control flow, and design patterns.',
        price: 1999,
        category: 'Development',
        image: 'adv_js.png',
        duration: '10h 15m',
        lessonsCount: 15,
        sections: [
          {
            title: 'Section 1: Advanced Scope & Closures',
            lessons: [
              { id: 'js_s1l1', title: 'Lexical Scope & Hoisting', duration: '15:30' },
              { id: 'js_s1l2', title: 'Understanding Closures', duration: '18:45' }
            ]
          }
        ]
      },
      {
        title: 'React for Beginners',
        instructor: 'Jane Smith',
        description: 'Start building single-page applications with React hooks, context, and modern patterns.',
        price: 1299,
        category: 'Development',
        image: 'react_beginners.png',
        duration: '8h 30m',
        lessonsCount: 12,
        sections: [
          {
            title: 'Section 1: Intro to React',
            lessons: [
              { id: 'r_s1l1', title: 'What is React?', duration: '10:15' }
            ]
          }
        ]
      },
      {
        title: 'AWS Cloud Practitioner',
        instructor: 'Cloud Academy',
        description: 'Learn the fundamentals of AWS services, security, architecture, and billing.',
        price: 2499,
        category: 'Cloud Computing',
        image: 'aws_practitioner.png',
        duration: '15h 00m',
        lessonsCount: 20,
        sections: [
          {
            title: 'Section 1: AWS Fundamentals',
            lessons: [
              { id: 'aws_s1l1', title: 'What is Cloud Computing?', duration: '12:00' }
            ]
          }
        ]
      },
      {
        title: 'Figma UI Design',
        instructor: 'CareerHub',
        description: 'Learn professional interface design, design systems, and auto-layout in Figma.',
        price: 999,
        category: 'Design',
        image: 'figma_uiux.png',
        duration: '6h 45m',
        lessonsCount: 10,
        sections: [
          {
            title: 'Section 1: Figma Basics',
            lessons: [
              { id: 'fig_s1l1', title: 'Introduction to Figma Interface', duration: '08:45' }
            ]
          }
        ]
      }
    ];

    const seededCourses = await Course.insertMany(coursesData);
    console.log(`${seededCourses.length} Courses seeded.`);

    // 2. Seed Default User (Matches Profile screenshot)
    const user = await User.create({
      name: 'Arshad Khan',
      email: 'arshadkhan@gmail.com',
      password: 'password123', // Will be hashed by user pre-save hook
      phone: '+91 98765 43210',
      location: 'Hyderabad, India',
      gender: 'Male',
      dob: new Date('2002-05-15'),
      aboutMe: 'Passionate web developer with a strong interest in building clean, user-friendly web applications. I love learning new technologies and solving real-world problems.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git & GitHub', 'Figma'],
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      achievements: [
        { title: 'Python Certificate - Completed Python for Beginners', date: new Date('2024-05-10') },
        { title: 'UI/UX Design Course - Completed UI/UX Design Basics', date: new Date('2024-04-20') },
        { title: 'Web Development Bootcamp - Completed 10 Projects', date: new Date('2024-03-15') }
      ],
      activityLog: [
        { text: 'Enrolled in UI/UX Design Fundamentals', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { text: 'Applied for Frontend Developer', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { text: 'Earned Certificate in React Basics', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ]
    });
    console.log(`User created: ${user.email} (password: password123)`);

    // 3. Create Enrollment (UI/UX Design Fundamentals, Progress: 65%)
    const uiuxCourse = seededCourses.find(c => c.title === 'UI/UX Design Fundamentals');
    if (uiuxCourse) {
      await Enrollment.create({
        user: user._id,
        course: uiuxCourse._id,
        progress: 65,
        completedLessons: ['s1l1', 's1l3'],
        status: 'active'
      });
      console.log('Enrollment seeded.');
    }

    // 4. Seed Tasks
    const tasks = [
      { user: user._id, title: 'React Assignment', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { user: user._id, title: 'Python Quiz', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { user: user._id, title: 'UI/UX Project', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) },
      { user: user._id, title: 'Mock Interview', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    ];
    await Task.insertMany(tasks);
    console.log('Tasks seeded.');

    // 5. Seed Job Applications
    const applications = [
      { user: user._id, jobSlug: 'frontend-developer', title: 'Frontend Developer', company: 'TechNova Solutions', salaryRange: '₹ 12 - 18 LPA', resumeUrl: 'Arshad_Khan_Resume.pdf', status: 'Under Review' },
      { user: user._id, jobSlug: 'uiux-designer', title: 'UI/UX Designer', company: 'PixelPerfect', salaryRange: '₹ 6 - 10 LPA', resumeUrl: 'Arshad_Khan_Resume.pdf', status: 'Shortlisted' },
      { user: user._id, jobSlug: 'web-developer', title: 'Web Developer', company: 'CodeCraft Labs', salaryRange: '₹ 6 - 10 LPA', resumeUrl: 'Arshad_Khan_Resume.pdf', status: 'Applied' }
    ];
    await JobApplication.insertMany(applications);
    console.log('Job Applications seeded.');

    // 6. Seed Saved Jobs
    const savedJobs = [
      { user: user._id, slug: 'backend-developer-node-js-codeverse-pvt-ltd-1', title: 'Backend Developer (Node.js)', company: 'CodeVerse Pvt. Ltd.', location: 'Hyderabad, India', tags: ['Node.js', 'Express.js', 'MongoDB', 'REST API'] },
      { user: user._id, slug: 'data-analyst-datainsights-2', title: 'Data Analyst', company: 'DataInsights', location: 'Pune, India', tags: ['SQL', 'Python', 'Power BI', 'Excel'] },
      { user: user._id, slug: 'product-manager-innovatech-3', title: 'Product Manager', company: 'InnovaTech', location: 'Bengaluru, India', tags: ['Product Strategy', 'Roadmap', 'Agile', 'JIRA'] }
    ];
    await SavedJob.insertMany(savedJobs);
    console.log('Saved Jobs seeded.');

    console.log('In-memory database seeding completed successfully!');
  } catch (err) {
    console.error('In-memory seeding error:', err.message);
  }
};

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth-backend';
  
  try {
    // Attempt standard connection first (timeout 2s)
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Failed to connect to local database at ${uri}.`);
    console.log('Spinning up MongoMemoryServer for standalone execution...');
    
    try {
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          startupTimeout: 90000 // 90 seconds to prevent slow connection timeouts
        }
      });
      const memoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`URI: ${memoryUri}`);
      
      // Seed data automatically
      await seedInMemoryDB();
    } catch (memError) {
      console.error(`Database Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
