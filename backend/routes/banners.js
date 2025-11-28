const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { adminRequired } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

/**
 * GET /api/banners - Get all banner images
 */
router.get("/api/banners", async (req, res) => {
  try {
    const [banners] = await db.query(
      "SELECT * FROM banner_images ORDER BY display_order ASC, id ASC"
    );
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

/**
 * POST /api/banners - Add a new banner image (Admin only)
 */
router.post("/api/banners", adminRequired, async (req, res) => {
  try {
    const { image_url, display_order } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    const [result] = await db.query(
      "INSERT INTO banner_images (image_url, display_order) VALUES (?, ?)",
      [image_url, display_order || 0]
    );

    const [newBanner] = await db.query(
      "SELECT * FROM banner_images WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newBanner[0]);
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ error: "Failed to add banner" });
  }
});

/**
 * DELETE /api/banners/:id - Delete a banner image (Admin only)
 */
router.delete("/api/banners/:id", adminRequired, async (req, res) => {
  try {
    const bannerId = req.params.id;

    // Get the banner to delete its image file
    const [banners] = await db.query(
      "SELECT image_url FROM banner_images WHERE id = ?",
      [bannerId]
    );

    if (banners.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const banner = banners[0];

    // Delete the banner from database
    await db.query("DELETE FROM banner_images WHERE id = ?", [bannerId]);

    // Try to delete the image file if it exists
    if (banner.image_url && banner.image_url.startsWith("/static/images/")) {
      const filename = banner.image_url.replace("/static/images/", "");
      const filePath = path.join(__dirname, "..", "static", "images", filename);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileError) {
          console.error("Error deleting image file:", fileError);
          // Continue even if file deletion fails
        }
      }
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

/**
 * PUT /api/banners/:id/order - Update display order (Admin only)
 */
router.put("/api/banners/:id/order", adminRequired, async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { display_order } = req.body;

    if (display_order === undefined) {
      return res.status(400).json({ error: "display_order is required" });
    }

    await db.query(
      "UPDATE banner_images SET display_order = ? WHERE id = ?",
      [display_order, bannerId]
    );

    res.json({ message: "Display order updated successfully" });
  } catch (error) {
    console.error("Error updating display order:", error);
    res.status(500).json({ error: "Failed to update display order" });
  }
});

module.exports = router;

