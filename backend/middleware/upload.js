const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure upload settings
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || "static/images";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Allowed file types
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif"];

function allowedFile(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

function generateUniqueFilename(productName, originalFilename) {
  // Create a safe product name for the filename
  let safeProductName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();

  // Get file extension
  const ext = originalFilename.split(".").pop().toLowerCase();

  // Add timestamp for uniqueness
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .split(".")[0];

  return `${safeProductName}_${timestamp}.${ext}`;
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Ensure directory exists
      if (!fs.existsSync(UPLOAD_FOLDER)) {
        fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
      }
      cb(null, UPLOAD_FOLDER);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const productName = req.body.product_name || "product";
      if (!file.originalname) {
        return cb(new Error("Invalid file name"));
      }
      const uniqueFilename = generateUniqueFilename(
        productName,
        file.originalname
      );
      cb(null, uniqueFilename);
    } catch (error) {
      cb(error);
    }
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedFile(file.originalname)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File type not allowed. Only PNG, JPG, JPEG, and GIF are allowed."
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = {
  upload,
  UPLOAD_FOLDER,
};
