import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    // If token expired, clean local storage
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

// Authentication Endpoints
export const authAPI = {
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
};

// Dashboard Endpoint
export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
};

// Course Catalog Endpoints
export const coursesAPI = {
  getCourses: () => api.get('/courses'),
  getCourseById: (id) => api.get(`/courses/${id}`),
};

// User Enrolled Courses Endpoints
export const myCoursesAPI = {
  getMyCourses: () => api.get('/my-courses'),
  getMyCourseById: (courseId) => api.get(`/my-courses/${courseId}`),
  toggleLessonComplete: (courseId, lessonId) => api.post(`/my-courses/${courseId}/lessons/${lessonId}/complete`),
};

// Payments & Checkout Endpoints
export const paymentAPI = {
  checkout: (courseId, discountCode = '', paymentMethod = 'Card') => 
    api.post('/payments/checkout', { courseId, discountCode, paymentMethod }),
  verifyPayment: (orderId, paymentStatus) => 
    api.post('/payments/verify', { orderId, paymentStatus }),
};

// Job Portal Endpoints
export const jobsAPI = {
  getJobs: (search = '', location = '', jobType = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (jobType) params.append('jobType', jobType);
    const queryStr = params.toString();
    return api.get(`/jobs${queryStr ? `?${queryStr}` : ''}`);
  },
  toggleSaveJob: (slug, jobDetails) => api.post(`/jobs/save/${slug}`, jobDetails),
  getSavedJobs: () => api.get('/jobs/saved'),
  applyJob: (applicationData) => api.post('/jobs/apply', applicationData),
  getApplications: () => api.get('/jobs/applications'),
};

// ATS Resume Analyzer Endpoint
export const atsAPI = {
  analyzeResume: (resumeName) => api.post('/ats/analyze', { resumeName }),
};

// User Profile Endpoints
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

export default api;
