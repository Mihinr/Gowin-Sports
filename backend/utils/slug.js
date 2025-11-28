const pool = require('../config/database');

/**
 * Generate a URL-friendly slug from a product name
 * Example: "Yonex Voltric Lite 20I" -> "yonex-voltric-lite-20i"
 */
function generateSlug(name) {
  // Convert to lowercase
  let slug = name.toLowerCase();
  
  // Remove special characters and replace spaces with hyphens
  slug = slug.replace(/[^\w\s-]/g, '');
  slug = slug.replace(/[-\s]+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.trim().replace(/^-+|-+$/g, '');
  
  return slug;
}

/**
 * Ensure the slug is unique by appending a number if needed
 */
async function ensureUniqueSlug(slug, productId = null) {
  const connection = await pool.getConnection();
  try {
    let baseSlug = slug;
    let counter = 1;
    
    while (true) {
      let sql, params;
      
      if (productId) {
        sql = "SELECT id FROM products WHERE slug = ? AND id != ?";
        params = [slug, productId];
      } else {
        sql = "SELECT id FROM products WHERE slug = ?";
        params = [slug];
      }
      
      const [rows] = await connection.execute(sql, params);
      
      if (rows.length === 0) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  } finally {
    connection.release();
  }
}

module.exports = {
  generateSlug,
  ensureUniqueSlug
};

