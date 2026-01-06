const express = require("express");
const multer = require("multer");
const { sendContactEmail } = require("../services/mailer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

router.post("/", upload.array("files", 5), async (req, res) => {
  const { name, email, app, urgency, msg } = req.body;

  if (!name || !email || !app || !urgency || !msg) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    await sendContactEmail({
      name,
      email,
      app,
      urgency,
      msg,
      files: req.files || [],
    });

    return res.status(200).json({ status: "sent" });
  } catch (error) {
    console.error("Contact email failed", error);
    return res.status(500).json({ error: "email_failed" });
  }
});

module.exports = router;
