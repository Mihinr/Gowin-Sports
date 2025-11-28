const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to get main product image
 */
async function getMainProductImage(productId) {
  const connection = await pool.getConnection();
  try {
    const [mainImages] = await connection.execute(
      "SELECT image_url FROM product_images WHERE product_id = ? AND is_main = TRUE ORDER BY id ASC LIMIT 1",
      [productId]
    );
    
    if (mainImages.length > 0) {
      return mainImages[0].image_url;
    }
    
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
 * Generate sitemap.xml
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://www.winners.lk';
    const now = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    xml += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/contact', priority: '0.8', changefreq: 'monthly' }
    ];
    
    // Note: Removed /sessions and /about as they don't exist in the current app
    
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += '  </url>\n';
    }
    
    // Category pages
    const categories = ['shoes', 'rackets', 'grips', 'bags', 'headbands', 'wristbands', 'clothing', 'shuttlecocks', 'socks', 'strings'];
    for (const category of categories) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/badminton/${category}</loc>\n`;
      xml += '    <priority>0.9</priority>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += '  </url>\n';
    }
    
    // Product pages
    const connection = await pool.getConnection();
    try {
      const [products] = await connection.execute(
        "SELECT id, slug FROM products WHERE slug IS NOT NULL"
      );
      
      for (const product of products) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
        xml += '    <priority>0.7</priority>\n';
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += `    <lastmod>${now}</lastmod>\n`;
        
        // Add product image if available
        const mainImage = await getMainProductImage(product.id);
        if (mainImage) {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${baseUrl}${mainImage}</image:loc>\n`;
          xml += '    </image:image>\n';
        }
        
        xml += '  </url>\n';
      }
    } finally {
      connection.release();
    }
    
    xml += '</urlset>';
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Serve robots.txt
 */
router.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, '..', 'static', 'robots.txt');
  
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    // Generate robots.txt if file doesn't exist
    const robotsContent = `User-agent: *
Allow: /

# Disallow admin panel
Disallow: /admin

# Disallow API endpoints
Disallow: /api/

# Sitemap location
Sitemap: https://www.winners.lk/sitemap.xml

# Crawl-delay (optional, adjust as needed)
Crawl-delay: 1
`;
    res.set('Content-Type', 'text/plain');
    res.send(robotsContent);
  }
});

module.exports = router;

