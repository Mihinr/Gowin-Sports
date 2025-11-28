const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { adminRequired } = require("../middleware/auth");
const { generateSlug, ensureUniqueSlug } = require("../utils/slug");

/**
 * Helper function to get main product image
 */
async function getMainProductImage(productId) {
  const connection = await pool.getConnection();
  try {
    // First, try to get the main image from product_images table
    const [mainImages] = await connection.execute(
      "SELECT image_url FROM product_images WHERE product_id = ? AND is_main = TRUE ORDER BY id ASC LIMIT 1",
      [productId]
    );
    
    if (mainImages.length > 0) {
      return mainImages[0].image_url;
    }
    
    // If no main image, get the first variant image
    const [variants] = await connection.execute(
      "SELECT image_url FROM variants WHERE product_id = ? ORDER BY id ASC LIMIT 1",
      [productId]
    );
    
    if (variants.length > 0) {
      return variants[0].image_url;
    }
    
    return null;
  } finally {
    connection.release();
  }
}

/**
 * Get all products
 */
router.get("/api/products", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [products] = await connection.execute(
      "SELECT *, COALESCE(out_of_stock, FALSE) as out_of_stock FROM products"
    );
    
    // Add main image to each product
    for (const product of products) {
      product.image_url = await getMainProductImage(product.id);
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get product by ID (for backward compatibility)
 */
router.get("/api/products/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const productId = parseInt(req.params.id);
    
    const [products] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const product = products[0];
    
    // Fetch all variants
    const [variants] = await connection.execute(
      "SELECT * FROM variants WHERE product_id = ?",
      [productId]
    );
    
    // Fetch all product images
    const [productImages] = await connection.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, id ASC",
      [productId]
    );
    
    product.variants = variants;
    product.product_images = productImages;
    
    // Set main image URL
    const mainImage = productImages.find((img) => img.is_main);
    if (mainImage) {
      product.main_image_url = mainImage.image_url;
    } else if (variants.length > 0 && variants[0].image_url) {
      product.main_image_url = variants[0].image_url;
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get product by slug (SEO-friendly)
 */
router.get("/api/products/slug/:slug", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const slug = req.params.slug;
    
    const [products] = await connection.execute(
      "SELECT * FROM products WHERE slug = ?",
      [slug]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const product = products[0];
    const productId = product.id;
    
    // Fetch all variants
    const [variants] = await connection.execute(
      "SELECT * FROM variants WHERE product_id = ?",
      [productId]
    );
    
    // Fetch all product images
    const [productImages] = await connection.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, id ASC",
      [productId]
    );
    
    product.variants = variants;
    product.product_images = productImages;
    
    // Set main image URL
    const mainImage = productImages.find((img) => img.is_main);
    if (mainImage) {
      product.main_image_url = mainImage.image_url;
    } else if (variants.length > 0 && variants[0].image_url) {
      product.main_image_url = variants[0].image_url;
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get products by category
 */
router.get("/api/products/category/:category", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const category = req.params.category;
    const collection = req.query.collection;
    const type = req.query.type;
    
    let sql = `
      SELECT p.id, p.name, p.slug, p.description, p.category, p.collection, p.type, p.price, p.discount_percentage, p.out_of_stock,
             p.installment_months, p.enable_mintpay, p.enable_koko,
             COALESCE(p.price, 0) as min_price,
             COALESCE(p.price, 0) as max_price,
             (SELECT v.image_url FROM variants v WHERE v.product_id = p.id LIMIT 1) as image_url
      FROM products p
      LEFT JOIN variants v ON p.id = v.product_id
      WHERE p.category = ?
    `;
    
    const params = [category];
    
    // Add collection filter
    if (collection && collection.toLowerCase() !== "all") {
      sql += " AND p.collection = ?";
      params.push(collection);
    }
    
    // Add type filter
    if (type && type.toLowerCase() !== "all") {
      sql += " AND p.type = ?";
      params.push(type);
    }
    
    sql += " GROUP BY p.id";
    
    const [products] = await connection.execute(sql, params);
    
    // Add main image and variants to each product
    for (const product of products) {
      product.image_url = await getMainProductImage(product.id);

      // Fetch variants for this product
      const [variants] = await connection.execute(
        "SELECT * FROM variants WHERE product_id = ?",
        [product.id]
      );
      product.variants = variants;
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get collections for a category
 */
router.get("/api/collections/:category", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const category = req.params.category;
    
    const [rows] = await connection.execute(
      "SELECT DISTINCT collection FROM products WHERE category = ? AND collection IS NOT NULL",
      [category]
    );
    
    const collections = rows.map((row) => row.collection);
    res.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get types for a category
 */
router.get("/api/types/:category", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const category = req.params.category;
    
    const [rows] = await connection.execute(
      "SELECT DISTINCT type FROM products WHERE category = ? AND type IS NOT NULL",
      [category]
    );
    
    const types = rows.map((row) => row.type);
    res.json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Create product (Admin)
 */
router.post("/api/admin/products", adminRequired, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const data = req.body;
    
    // Generate slug
    let slug = generateSlug(data.name);
    slug = await ensureUniqueSlug(slug);
    
    // Insert product
    const [result] = await connection.execute(
      `INSERT INTO products (name, slug, description, long_description, category, collection, type, price, discount_percentage, out_of_stock, installment_months, enable_mintpay, enable_koko, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        slug,
        data.description,
        data.long_description || "",
        data.category,
        data.collection || null,
        data.type || null,
        data.price || 0,
        data.discount_percentage || 0,
        data.out_of_stock || false,
        data.installment_months || 0,
        data.enable_mintpay || false,
        data.enable_koko || false,
        JSON.stringify(data.specs || {}),
      ]
    );
    
    const productId = result.insertId;
    
    // Handle product images
    if (data.product_images && Array.isArray(data.product_images)) {
      for (const image of data.product_images) {
        await connection.execute(
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
          [productId, image.image_url, image.is_main || false]
        );
      }
    }
    
    // Handle variants
    if (data.variants && Array.isArray(data.variants)) {
      for (const variant of data.variants) {
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
    
    await connection.commit();
    res.status(201).json({ message: "Product created", product_id: productId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating product:", error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Update product (Admin)
 */
router.put("/api/admin/products/:id", adminRequired, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const productId = parseInt(req.params.id);
    const data = req.body;
    
    // Generate slug if name changed
    let slug = null;
    if (data.name) {
      slug = generateSlug(data.name);
      slug = await ensureUniqueSlug(slug, productId);
    }
    
    // Update product
    if (slug) {
      await connection.execute(
        `UPDATE products 
         SET name = ?, slug = ?, description = ?, long_description = ?, 
             category = ?, collection = ?, type = ?, price = ?, discount_percentage = ?, out_of_stock = ?, 
             installment_months = ?, enable_mintpay = ?, enable_koko = ?, specs = ?
         WHERE id = ?`,
        [
          data.name,
          slug,
          data.description,
          data.long_description || "",
          data.category,
          data.collection || null,
          data.type || null,
          data.price || 0,
          data.discount_percentage || 0,
          data.out_of_stock !== undefined ? data.out_of_stock : false,
          data.installment_months || 0,
          data.enable_mintpay || false,
          data.enable_koko || false,
          JSON.stringify(data.specs || {}),
          productId,
        ]
      );
    } else {
      await connection.execute(
        `UPDATE products 
         SET description = ?, long_description = ?, 
             category = ?, collection = ?, type = ?, price = ?, discount_percentage = ?, out_of_stock = ?, 
             installment_months = ?, enable_mintpay = ?, enable_koko = ?, specs = ?
         WHERE id = ?`,
        [
          data.description,
          data.long_description || "",
          data.category,
          data.collection || null,
          data.type || null,
          data.price || 0,
          data.discount_percentage || 0,
          data.out_of_stock !== undefined ? data.out_of_stock : false,
          data.installment_months || 0,
          data.enable_mintpay || false,
          data.enable_koko || false,
          JSON.stringify(data.specs || {}),
          productId,
        ]
      );
    }
    
    // Handle product images updates
    if (data.product_images && Array.isArray(data.product_images)) {
      // Delete existing images
      await connection.execute(
        "DELETE FROM product_images WHERE product_id = ?",
        [productId]
      );
      
      // Insert new images
      for (const image of data.product_images) {
        await connection.execute(
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
          [productId, image.image_url, image.is_main || false]
        );
      }
    }
    
    // Handle variants updates
    if (data.variants && Array.isArray(data.variants)) {
      // Delete existing variants
      await connection.execute("DELETE FROM variants WHERE product_id = ?", [
        productId,
      ]);
      
      // Insert new variants
      for (const variant of data.variants) {
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
    
    await connection.commit();
    res.json({ message: "Product updated" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating product:", error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Delete product (Admin)
 */
router.delete("/api/admin/products/:id", adminRequired, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const productId = parseInt(req.params.id);
    
    await connection.execute("DELETE FROM products WHERE id = ?", [productId]);
    
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
