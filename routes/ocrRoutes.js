// routes/ocrRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const fs = require('fs');

// إعداد التخزين للصور باستخدام multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // مثل 165987.png
  }
});

const upload = multer({ storage: storage });

// نقطة النهاية: رفع الصورة وتحويلها لنص
router.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // معالجة الصورة بواسطة Tesseract
    const result = await Tesseract.recognize(imagePath, 'eng+ara', {
      logger: m => console.log(m) // لمتابعة التقدم (اختياري)
    });

    const extractedText = result.data.text;

    // حذف الصورة من السيرفر بعد المعالجة (اختياري)
    fs.unlinkSync(imagePath);

    // إرسال النص الناتج إلى الواجهة
    res.json({ text: extractedText });

  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء تحويل الصورة إلى نص' });
  }
});

module.exports = router;
