const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { adminRequired } = require("../middleware/auth");
const XLSX = require("xlsx");
const multer = require("multer");
const { generateSlug, ensureUniqueSlug } = require("../utils/slug");

/**
 * Ensure slug is unique within the current transaction
 */
async function ensureUniqueSlugInTransaction(connection, slug) {
  let baseSlug = slug;
  let counter = 1;
  
  while (true) {
    const [rows] = await connection.execute(
      "SELECT id FROM products WHERE slug = ?",
      [slug]
    );
    
    if (rows.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Safety check to prevent infinite loop
    if (counter > 1000) {
      throw new Error("Too many slug conflicts");
    }
  }
}

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    const validMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream", // Sometimes Excel files are detected as this
      "application/x-zip-compressed", // XLSX files are actually ZIP files
    ];
    
    // Check file extension
    const validExtensions = [".xlsx", ".xls"];
    const hasValidExtension = validExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    // Accept if MIME type is valid OR extension is valid
    if (validMimeTypes.includes(file.mimetype) || hasValidExtension) {
      console.log(`File accepted: ${file.originalname}, MIME: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`File rejected: ${file.originalname}, MIME: ${file.mimetype}`);
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

/**
 * Generate backup - Export all products to Excel
 */
router.get("/api/admin/backup/generate", adminRequired, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Fetch all products
    const [products] = await connection.execute(
      "SELECT * FROM products ORDER BY id ASC"
    );

    // Prepare data for Excel
    const excelData = [];

    for (const product of products) {
      // Fetch product images
      const [productImages] = await connection.execute(
        "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, id ASC",
        [product.id]
      );

      // Fetch variants
      const [variants] = await connection.execute(
        "SELECT * FROM variants WHERE product_id = ? ORDER BY id ASC",
        [product.id]
      );

      // Parse specs JSON
      let specs = {};
      try {
        specs = product.specs ? JSON.parse(product.specs) : {};
      } catch (e) {
        specs = {};
      }

      // Create a row for the product with all details
      const row = {
        id: product.id,
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        long_description: product.long_description || "",
        category: product.category || "",
        collection: product.collection || "",
        type: product.type || "",
        price: product.price || 0,
        discount_percentage: product.discount_percentage || 0,
        out_of_stock: product.out_of_stock ? "Yes" : "No",
        installment_months: product.installment_months || 0,
        enable_mintpay: product.enable_mintpay ? "Yes" : "No",
        enable_koko: product.enable_koko ? "Yes" : "No",
        specs: JSON.stringify(specs),
        // Product images - comma separated
        product_images: productImages
          .map((img) => img.image_url)
          .join(" | "),
        // Variants - JSON stringified for complex data
        variants: JSON.stringify(variants),
      };

      excelData.push(row);
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // id
      { wch: 30 }, // name
      { wch: 30 }, // slug
      { wch: 50 }, // description
      { wch: 100 }, // long_description
      { wch: 15 }, // category
      { wch: 15 }, // collection
      { wch: 20 }, // type
      { wch: 10 }, // price
      { wch: 10 }, // discount_percentage
      { wch: 10 }, // out_of_stock
      { wch: 10 }, // installment_months
      { wch: 10 }, // enable_mintpay
      { wch: 10 }, // enable_koko
      { wch: 50 }, // specs
      { wch: 200 }, // product_images
      { wch: 300 }, // variants
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers for file download
    const filename = `products_backup_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", excelBuffer.length);

    // Send the file
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating backup:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Restore backup - Import products from Excel
 */
router.post(
  "/api/admin/backup/restore",
  adminRequired,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    let connection;
    try {
      console.log("Restore backup request received");
      console.log("File info:", req.file ? { name: req.file.originalname, size: req.file.size } : "No file");
      
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      connection = await pool.getConnection();
      console.log("Database connection acquired");

      // Read Excel file from buffer
      let workbook;
      try {
        // Try reading as buffer with additional options for better compatibility
        workbook = XLSX.read(req.file.buffer, { 
          type: "buffer",
          cellDates: true,
          cellNF: false,
          cellText: false
        });
      } catch (error) {
        console.error("Error reading Excel file:", error);
        console.error("File info:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        return res.status(400).json({ 
          error: "Invalid Excel file format. Please ensure the file is a valid .xlsx or .xls file.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ error: "Excel file has no sheets" });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        return res.status(400).json({ error: "Excel file sheet is empty or invalid" });
      }

      // Convert to JSON
      let data;
      try {
        data = XLSX.utils.sheet_to_json(worksheet);
      } catch (error) {
        console.error("Error converting Excel to JSON:", error);
        return res.status(400).json({ error: "Error parsing Excel file data" });
      }

      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Excel file is empty or has no data rows" });
      }

      console.log(`Restoring ${data.length} products from backup...`);

      await connection.beginTransaction();
      console.log("Transaction started");

      // Truncate all products (this will cascade delete variants and images)
      console.log("Truncating existing tables...");
      await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
      await connection.execute("TRUNCATE TABLE variants");
      await connection.execute("TRUNCATE TABLE product_images");
      await connection.execute("TRUNCATE TABLE products");
      await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
      console.log("Tables truncated successfully");

      // Restore products from Excel
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Parse specs
          let specs = {};
          try {
            if (row.specs && typeof row.specs === 'string' && row.specs.trim()) {
              specs = JSON.parse(row.specs);
            } else if (row.specs && typeof row.specs === 'object') {
              specs = row.specs;
            }
          } catch (e) {
            console.warn(`Warning: Could not parse specs for row ${i + 1}:`, e.message);
            specs = {};
          }

          // Generate slug
          let slug = (row.slug && row.slug.trim()) ? row.slug.trim() : generateSlug(row.name || "");
          if (!slug) {
            slug = generateSlug(`product-${i + 1}`);
          }
          // Use transaction-aware slug check
          slug = await ensureUniqueSlugInTransaction(connection, slug);

          // Validate required fields
          if (!row.name || !row.name.trim()) {
            throw new Error(`Row ${i + 1}: Product name is required`);
          }

          // Insert product
          const [result] = await connection.execute(
            `INSERT INTO products (name, slug, description, long_description, category, collection, type, price, discount_percentage, out_of_stock, installment_months, enable_mintpay, enable_koko, specs)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.name.trim(),
              slug,
              (row.description || "").trim(),
              (row.long_description || "").trim(),
              row.category ? row.category.trim() : null,
              row.collection ? row.collection.trim() : null,
              row.type ? row.type.trim() : null,
              !isNaN(parseFloat(row.price)) ? parseFloat(row.price) : 0,
              !isNaN(parseFloat(row.discount_percentage)) ? parseFloat(row.discount_percentage) : 0,
              row.out_of_stock === "Yes" || row.out_of_stock === true || row.out_of_stock === 1 || row.out_of_stock === "1",
              !isNaN(parseInt(row.installment_months)) ? parseInt(row.installment_months) : 0,
              row.enable_mintpay === "Yes" || row.enable_mintpay === true || row.enable_mintpay === 1 || row.enable_mintpay === "1",
              row.enable_koko === "Yes" || row.enable_koko === true || row.enable_koko === 1 || row.enable_koko === "1",
              JSON.stringify(specs),
            ]
          );

        const productId = result.insertId;

          // Restore product images
          if (row.product_images) {
            let imageUrls = [];
            if (typeof row.product_images === 'string') {
              // Handle pipe-separated or comma-separated image URLs
              imageUrls = row.product_images
                .split(/[|,]/)
                .map((url) => url.trim())
                .filter((url) => url && url.length > 0);
            } else if (Array.isArray(row.product_images)) {
              imageUrls = row.product_images.filter((url) => url && url.trim());
            }

            for (let j = 0; j < imageUrls.length; j++) {
              await connection.execute(
                "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
                [productId, imageUrls[j], j === 0] // First image is main
              );
            }
          }

          // Restore variants
          if (row.variants) {
            let variants = [];
            try {
              if (typeof row.variants === 'string' && row.variants.trim()) {
                variants = JSON.parse(row.variants);
              } else if (Array.isArray(row.variants)) {
                variants = row.variants;
              }
            } catch (e) {
              console.warn(`Warning: Could not parse variants for product ${row.name || i + 1}:`, e.message);
            }

            if (Array.isArray(variants)) {
              for (const variant of variants) {
                await connection.execute(
                  `INSERT INTO variants (product_id, color, image_url, stock, size, grip_size, discount_percentage, frame_racket, racket_piece)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    productId,
                    variant.color || null,
                    variant.image_url || null,
                    variant.stock || 0,
                    variant.size || null,
                    variant.grip_size || "None",
                    variant.discount_percentage || 0,
                    variant.frame_racket || "None",
                    variant.racket_piece || "None",
                  ]
                );
              }
            }
          }
        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          throw new Error(`Error processing product at row ${i + 1}: ${rowError.message}`);
        }
      }

      await connection.commit();
      console.log("Transaction committed successfully");

      res.json({
        message: "Backup restored successfully",
        products_restored: data.length,
      });
    } catch (error) {
      console.error("=== ERROR RESTORING BACKUP ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error name:", error.name);
      
      if (connection) {
        try {
          await connection.rollback();
          console.log("Transaction rolled back");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      
      const errorMessage = error.message || "Failed to restore backup";
      console.error("Sending error response:", errorMessage);
      
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    } finally {
      if (connection) {
        try {
          connection.release();
          console.log("Connection released");
        } catch (releaseError) {
          console.error("Error releasing connection in finally:", releaseError);
        }
      }
    }
  }
);

module.exports = router;

