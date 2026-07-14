const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Ensure dotenv is loaded
dotenv.config();

const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary initialized successfully.');
} else {
  console.warn('⚠️ Cloudinary configuration missing. Uploads will fall back to local disk storage.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: isConfigured,
};
