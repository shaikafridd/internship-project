import axios from 'axios';

// ─── Regular User API Instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Admin API Instance (uses admin_token) ────────────────────────────────────
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach regular user JWT Token
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

// Request Interceptor: Attach admin JWT Token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for regular user API: handle 401
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

// Response Interceptor for admin API: handle 401
adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    if (error.response?.status === 401 && localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(new Error(message));
  }
);

// Authentication Endpoints
export const authAPI = {
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  adminLogin: (name, password) => api.post('/auth/admin/login', { name, password }),
  adminSetup: (name, password) => api.post('/auth/admin/setup', { name, password }),
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
  getJobs: (search = '', location = '', jobType = '', recommend = false) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (jobType) params.append('jobType', jobType);
    if (recommend) params.append('recommend', 'true');
    const queryStr = params.toString();
    return api.get(`/jobs${queryStr ? `?${queryStr}` : ''}`);
  },
  toggleSaveJob: (slug, jobDetails) => api.post(`/jobs/save/${slug}`, jobDetails),
  getSavedJobs: () => api.get('/jobs/saved'),
  applyJob: (applicationData) => api.post('/jobs/apply', applicationData),
  getApplications: () => api.get('/jobs/applications'),
};

// ATS Resume Analyzer Endpoint (Our Local Express Backend which routes to Render)
export const atsAPI = {
  analyzeResume: async (file, includeFeedback = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(
      `/ats/analyze?includeFeedback=${includeFeedback}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },
  saveAtsResults: (atsData) => api.post('/ats/save', atsData),
};

// User Profile Endpoints
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

// Admin Endpoints
export const adminAPI = {
  // Public: authenticate with username + password, returns { success, token, user }
  login: (username, password) => adminApi.post('/admin/login', { username, password }),
  // Protected: fetches dashboard stats (uses admin_token via interceptor)
  getDashboard: () => adminApi.get('/admin/dashboard'),
  // Courses CRUD
  getCourses: () => adminApi.get('/admin/courses'),
  createCourse: (courseData) => adminApi.post('/admin/courses', courseData),
  updateCourse: (id, courseData) => adminApi.put(`/admin/courses/${id}`, courseData),
  deleteCourse: (id) => adminApi.delete(`/admin/courses/${id}`),
  // Payments CRUD
  getPayments: () => adminApi.get('/admin/payments'),
  updatePaymentStatus: (id) => adminApi.put(`/admin/payments/${id}`),
  deletePayment: (id) => adminApi.delete(`/admin/payments/${id}`),
};

export default api;
