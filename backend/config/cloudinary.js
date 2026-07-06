const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
  console.log('[Cloudinary] Configured with API credentials.');
} else {
  console.log('[Cloudinary] Missing credentials. Using LOCAL SIMULATED IMAGE STORAGE.');
  
  // Ensure local uploads directory exists
  const uploadsDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Custom wrapper for uploader
const uploader = {
  upload: async (file, options = {}) => {
    if (isConfigured) {
      return cloudinary.uploader.upload(file, options);
    } else {
      // Simulate upload by checking if the file is a path, base64 data, or a buffer
      try {
        let fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const uploadsDir = path.join(__dirname, '../public/uploads');
        let filePath = path.join(uploadsDir, fileName);

        if (file.startsWith('data:image')) {
          // Base64 string
          const base64Data = file.split(';base64,').pop();
          fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        } else if (fs.existsSync(file)) {
          // File path - copy it
          fs.copyFileSync(file, filePath);
        } else {
          // Return placeholder image URL if not recognizable
          return {
            secure_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
            public_id: 'placeholder_id',
          };
        }

        const PORT = process.env.PORT || 5000;
        const secure_url = `http://localhost:${PORT}/uploads/${fileName}`;
        console.log(`[Cloudinary Mock] Saved uploaded file locally: ${secure_url}`);
        return {
          secure_url,
          public_id: fileName,
        };
      } catch (err) {
        console.error('[Cloudinary Mock] Error saving mock file:', err);
        return {
          secure_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
          public_id: 'placeholder_id',
        };
      }
    }
  },
  destroy: async (publicId) => {
    if (isConfigured) {
      return cloudinary.uploader.destroy(publicId);
    } else {
      try {
        const filePath = path.join(__dirname, '../public/uploads', publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[Cloudinary Mock] Deleted local file: ${publicId}`);
        }
        return { result: 'ok' };
      } catch (err) {
        console.error('[Cloudinary Mock] Error deleting file:', err);
        return { result: 'not found' };
      }
    }
  }
};

module.exports = { uploader };
