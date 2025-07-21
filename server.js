const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// تحميل متغيرات البيئة من .env
dotenv.config();

// إنشاء التطبيق
const app = express();

// ميدل وير
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ملفات الصور - public access لمجلد uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// استدعاء الراوتر
const ocrRoutes = require('./routes/ocrRoutes');
app.use('/', ocrRoutes);

// الاتصال بقاعدة البيانات بدون التحذيرات القديمة
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // بدء تشغيل السيرفر
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });
