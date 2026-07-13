const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Task = require('./models/Task');
const JobApplication = require('./models/JobApplication');
const User = require('./models/User');

dotenv.config();

const coursesData = [
  {
    title: 'UI/UX Design Mastercourse',
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
          { id: 's2l2', title: 'Conducting User Interviews', duration: '15:20' },
          { id: 's2l3', title: 'Creating Personas', duration: '11:10' },
          { id: 's2l4', title: 'Empathy Mapping', duration: '09:30' },
          { id: 's2l5', title: 'Synthesizing Research Findings', duration: '12:00' }
        ]
      },
      {
        title: 'Section 3: Wireframing',
        lessons: [
          { id: 's3l1', title: 'Sketching and Ideation', duration: '08:00' },
          { id: 's3l2', title: 'Low-Fidelity Wireframes', duration: '14:30' },
          { id: 's3l3', title: 'Information Architecture', duration: '10:15' },
          { id: 's3l4', title: 'User Flows', duration: '11:45' }
        ]
      },
      {
        title: 'Section 4: Design Principles',
        lessons: [
          { id: 's4l1', title: 'Visual Hierarchy', duration: '09:30' },
          { id: 's4l2', title: 'Color Theory in UI', duration: '13:00' },
          { id: 's4l3', title: 'Typography and Layouts', duration: '12:15' },
          { id: 's4l4', title: 'Grid Systems', duration: '08:45' },
          { id: 's4l5', title: 'Designing for Accessibility', duration: '14:00' }
        ]
      },
      {
        title: 'Section 5: Prototyping',
        lessons: [
          { id: 's5l1', title: 'High-Fidelity Prototyping', duration: '15:00' },
          { id: 's5l2', title: 'Micro-interactions', duration: '11:20' },
          { id: 's5l3', title: 'Transitions and Gestures', duration: '10:45' },
          { id: 's5l4', title: 'Usability Testing of Prototypes', duration: '13:15' }
        ]
      },
      {
        title: 'Section 6: Tools & Handoff',
        lessons: [
          { id: 's6l1', title: 'Design System Creation', duration: '16:30' },
          { id: 's6l2', title: 'Developer Handoff Best Practices', duration: '09:00' },
          { id: 's6l3', title: 'Portfolio Preparation', duration: '15:15' }
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
          { id: 'js_s1l2', title: 'Understanding Closures', duration: '18:45' },
          { id: 'js_s1l3', title: 'Module Pattern', duration: '14:20' }
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
          { id: 'r_s1l1', title: 'What is React?', duration: '10:15' },
          { id: 'r_s1l2', title: 'Components & Props', duration: '14:30' },
          { id: 'r_s1l3', title: 'State & Event Handling', duration: '18:00' }
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
          { id: 'aws_s1l1', title: 'What is Cloud Computing?', duration: '12:00' },
          { id: 'aws_s1l2', title: 'AWS Global Infrastructure', duration: '15:30' }
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
          { id: 'fig_s1l1', title: 'Introduction to Figma Interface', duration: '08:45' },
          { id: 'fig_s1l2', title: 'Working with Shapes & Vectors', duration: '12:15' }
        ]
      }
    ]
  }
];

const SavedJob = require('./models/SavedJob');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // 1. Seed Courses
    await Course.deleteMany();
    console.log('Existing Courses deleted.');
    const seededCourses = await Course.insertMany(coursesData);
    console.log(`${seededCourses.length} Courses seeded successfully.`);

    // Find if we have any users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found in database. Profile details seeding skipped.');
      console.log('Create a user via signup to seed profile details for them.');
    } else {
      // Clear tasks, job applications, and saved jobs for existing users
      await Task.deleteMany();
      await JobApplication.deleteMany();
      await SavedJob.deleteMany();
      console.log('Existing Tasks, Job Applications & Saved Jobs deleted.');

      for (const user of users) {
        // Update user profile fields
        user.phone = '+91 98765 43210';
        user.location = 'Hyderabad, India';
        user.gender = 'Male';
        user.dob = new Date('2002-05-15');
        user.aboutMe = 'Passionate web developer with a strong interest in building clean, user-friendly web applications. I love learning new technologies and solving real-world problems.';
        user.skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git & GitHub', 'Figma'];
        user.photoUrl = 'https://randomuser.me/api/portraits/men/43.jpg';
        
        user.achievements = [
          { title: 'Python Certificate - Completed Python for Beginners', date: new Date('2024-05-10') },
          { title: 'UI/UX Design Course - Completed UI/UX Design Basics', date: new Date('2024-04-20') },
          { title: 'Web Development Bootcamp - Completed 10 Projects', date: new Date('2024-03-15') }
        ];

        user.activityLog = [
          { text: 'Enrolled in UI/UX Design Fundamentals', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { text: 'Applied for Frontend Developer', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { text: 'Earned Certificate in React Basics', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ];

        await user.save();

        // Seed Tasks
        const tasks = [
          {
            user: user._id,
            title: 'Mock Interview',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          },
          {
            user: user._id,
            title: 'React Assignment',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          },
          {
            user: user._id,
            title: 'Python Quiz',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          },
          {
            user: user._id,
            title: 'UI/UX Project',
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
          }
        ];
        await Task.insertMany(tasks);

        // Seed Job Applications
        const applications = [
          {
            user: user._id,
            jobSlug: 'senior-frontend-developer-technova',
            title: 'Senior Frontend Developer',
            company: 'TechNova Solutions',
            salaryRange: '₹ 12 - 18 LPA',
            resumeUrl: 'Arshad_Khan_Resume.pdf',
            coverLetterUrl: 'Cover_Letter.pdf',
            status: 'Shortlisted',
          },
          {
            user: user._id,
            jobSlug: 'uiux-designer-pixelperfect',
            title: 'UI/UX Designer',
            company: 'PixelPerfect',
            salaryRange: '₹ 6 - 10 LPA',
            resumeUrl: 'Arshad_Khan_Resume.pdf',
            coverLetterUrl: '',
            status: 'Applied',
          }
        ];
        await JobApplication.insertMany(applications);

        // Seed Saved Jobs
        const savedJobs = [
          {
            user: user._id,
            slug: 'backend-developer-node-js-codeverse-pvt-ltd-1',
            title: 'Backend Developer (Node.js)',
            company: 'CodeVerse Pvt. Ltd.',
            location: 'Hyderabad, India',
            tags: ['Node.js', 'Express.js', 'MongoDB', 'REST API'],
          },
          {
            user: user._id,
            slug: 'data-analyst-datainsights-2',
            title: 'Data Analyst',
            company: 'DataInsights',
            location: 'Pune, India',
            tags: ['SQL', 'Python', 'Power BI', 'Excel'],
          },
          {
            user: user._id,
            slug: 'product-manager-innovatech-3',
            title: 'Product Manager',
            company: 'InnovaTech',
            location: 'Bengaluru, India',
            tags: ['Product Strategy', 'Roadmap', 'Agile', 'JIRA'],
          }
        ];
        await SavedJob.insertMany(savedJobs);

        console.log(`Seeded Profile, Tasks, Applications & Saved Jobs for user: ${user.email}`);
      }
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();
