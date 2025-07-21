const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const fs = require('fs');

// تخزين الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

// تصفية الملفات
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('❌ فقط ملفات صور بصيغة JPG/PNG مسموح بها'));
    }
  }
});

// نقطة رفع وتحويل الصور
router.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '❌ لم يتم رفع أي ملف' });
    }

    const imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, 'eng+ara', {
      logger: m => console.log(m)
    });

    const extractedText = result.data.text;

    // حذف الصورة بعد المعالجة
    fs.unlinkSync(imagePath);

    res.json({ text: extractedText });

  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء التحويل' });
  }
});

// التقاط أخطاء multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('فقط ملفات صور')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
