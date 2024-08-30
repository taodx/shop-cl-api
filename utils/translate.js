const express = require("express");
const router = express.Router();
const translate = require("@vitalets/google-translate-api");

router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({
      status: false,
      message: "Text and targetLang are required",
    });
  }

  try {
    const result = await translate(text, { to: targetLang });
    res.json({
      status: true,
      originalText: text,
      translatedText: result.text,
      sourceLang: result.from.language.iso,
      targetLang: targetLang,
    });
  } catch (error) {
    console.log(error); // Thêm dòng này để log lỗi
    res.status(500).json({
      status: false,
      message: "Translation failed",
      error: error.message,
    });
  }
});

module.exports = router;
