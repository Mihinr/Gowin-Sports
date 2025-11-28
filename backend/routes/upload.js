const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { upload, UPLOAD_FOLDER } = require("../middleware/upload");
const { adminRequired } = require("../middleware/auth");

/**
 * Image upload endpoint
 */
router.post("/api/admin/upload-image", adminRequired, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ error: "File too large. Maximum size is 10MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res
        .status(400)
        .json({ error: err.message || "File upload failed" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Return relative URL to the image
      const imageUrl = `/static/images/${req.file.filename}`;
      res.json({ image_url: imageUrl });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
});

/**
 * Serve static images
 */
router.get("/static/images/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, "..", UPLOAD_FOLDER, filename));
});

module.exports = router;
