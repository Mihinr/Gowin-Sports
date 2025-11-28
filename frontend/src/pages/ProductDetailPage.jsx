import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentOptions from "../components/PaymentOptions";
import useSEO from "../hooks/useSEO";
import { API_BASE_URL } from "../config";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 10,
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

const ProductDetailPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedGripSize, setSelectedGripSize] = useState(null);
  const [selectedFrameRacket, setSelectedFrameRacket] = useState(null);
  const [selectedRacketPiece, setSelectedRacketPiece] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Get min and max prices (now from product.price with product-level and variant discounts)
  const getProductPrice = () => {
    if (!product || !product.price) return null;
    const basePrice = parseFloat(product.price) || 0;
    if (basePrice === 0) return null;

    const productDiscount = product.discount_percentage || 0;
    const allDiscountedPrices = [];

    // Add product-level discount if exists
    if (productDiscount > 0) {
      allDiscountedPrices.push(basePrice * (1 - productDiscount / 100));
    }

    // If there are variants with discounts, calculate discounted prices
    if (product.variants && product.variants.length > 0) {
      product.variants
        .filter((v) => v.discount_percentage > 0)
        .forEach((v) => {
          const variantDiscount = v.discount_percentage || 0;
          // Use variant discount if it's higher than product discount, otherwise use product discount
          const effectiveDiscount =
            variantDiscount > productDiscount
              ? variantDiscount
              : productDiscount;
          allDiscountedPrices.push(basePrice * (1 - effectiveDiscount / 100));
        });
    }

    if (allDiscountedPrices.length > 0) {
      return {
        min: Math.min(...allDiscountedPrices),
        max: Math.max(...allDiscountedPrices),
      };
    }

    return { min: basePrice, max: basePrice };
  };

  const priceRange = getProductPrice();
  const minPrice = priceRange ? priceRange.min : product?.price || null;
  const maxPrice = priceRange ? priceRange.max : product?.price || null;

  // SEO Configuration with structured data
  useSEO(
    product
      ? {
          title: `${product.name} - Gowin Sports | Badminton Equipment`,
          description:
            product.long_description ||
            `${product.name} - Premium badminton equipment at Gowin Sports. Shop now!`,
          keywords: `${product.name}, ${product.category}, badminton, ${
            product.collection || ""
          }, ${product.type || ""}, gowin sports, badminton equipment`,
          url: `/products/${product.slug || slug}`,
          image:
            product.main_image_url ||
            (product.product_images && product.product_images[0]?.image_url) ||
            (product.variants && product.variants[0]?.image_url),
          type: "product",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.long_description || product.name,
            image: product.main_image_url
              ? `${API_BASE_URL}${product.main_image_url}`
              : undefined,
            brand: {
              "@type": "Brand",
              name: product.collection || "Gowin Sports",
            },
            category: product.category,
            offers: minPrice
              ? {
                  "@type": "AggregateOffer",
                  priceCurrency: "LKR",
                  lowPrice: minPrice.toString(),
                  highPrice:
                    maxPrice && maxPrice !== minPrice
                      ? maxPrice.toString()
                      : undefined,
                  availability: "https://schema.org/InStock",
                  url: `${API_BASE_URL}/products/${product.slug || slug}`,
                }
              : undefined,
            sku: product.slug,
            mpn: product.id?.toString(),
          },
        }
      : null
  );

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let response;

        if (slug) {
          response = await fetch(`/api/products/slug/${slug}`);
        } else if (id) {
          response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.slug) {
              navigate(`/products/${data.slug}`, { replace: true });
              return;
            }
            setProduct(data);
            return;
          }
        } else {
          throw new Error("No product identifier provided");
        }

        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);

        // Find first in-stock variant and select it
        if (data.variants.length > 0) {
          // If product is marked as out of stock, don't try to find in-stock variant
          // Otherwise, find first in-stock variant
          const inStockVariant = data.out_of_stock
            ? null
            : data.variants.find((v) => v.stock > 0);

          if (inStockVariant) {
            setSelectedColor(inStockVariant.color);
            setSelectedVariant(inStockVariant);

            // Set other variant attributes if they exist
            if (inStockVariant.size) {
              setSelectedSize(inStockVariant.size);
            }
            if (
              inStockVariant.grip_size &&
              inStockVariant.grip_size !== "None"
            ) {
              setSelectedGripSize(inStockVariant.grip_size);
            }
            if (
              inStockVariant.frame_racket &&
              inStockVariant.frame_racket !== "None"
            ) {
              setSelectedFrameRacket(inStockVariant.frame_racket);
            }
            if (
              inStockVariant.racket_piece &&
              inStockVariant.racket_piece !== "None"
            ) {
              setSelectedRacketPiece(inStockVariant.racket_piece);
            }
          } else {
            // If no in-stock variant, select first variant anyway
            setSelectedColor(data.variants[0].color);
            setSelectedVariant(data.variants[0]);
          }
        }

        const validProductImages = (data.product_images || []).filter(
          (img) => img.image_url && img.image_url.trim() !== ""
        );

        const validVariantImages = (data.variants || [])
          .map((v) => ({
            image_url: v.image_url,
            is_variant: true,
            variant_color: v.color,
          }))
          .filter((img) => img.image_url && img.image_url.trim() !== "");

        const combinedImages = [...validProductImages, ...validVariantImages];
        setAllImages(combinedImages);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [slug, id, navigate]);

  // Update selected variant when filters change
  useEffect(() => {
    if (product && selectedColor) {
      let filteredVariants = product.variants.filter(
        (v) => v.color === selectedColor
      );

      if (selectedSize) {
        filteredVariants = filteredVariants.filter(
          (v) => v.size === selectedSize
        );
      }
      if (selectedGripSize) {
        filteredVariants = filteredVariants.filter(
          (v) => v.grip_size === selectedGripSize
        );
      }
      if (selectedFrameRacket) {
        filteredVariants = filteredVariants.filter(
          (v) => v.frame_racket === selectedFrameRacket
        );
      }
      if (selectedRacketPiece) {
        filteredVariants = filteredVariants.filter(
          (v) => v.racket_piece === selectedRacketPiece
        );
      }

      // Prefer in-stock variants, but fall back to out-of-stock if none available
      const inStockVariant = filteredVariants.find((v) => v.stock > 0);
      const newSelectedVariant = inStockVariant || filteredVariants[0] || null;
      setSelectedVariant(newSelectedVariant);

      if (
        newSelectedVariant &&
        newSelectedVariant.image_url &&
        newSelectedVariant.image_url.trim() !== ""
      ) {
        const variantImageIndex = allImages.findIndex(
          (img) =>
            img.is_variant &&
            img.variant_color === newSelectedVariant.color &&
            img.image_url === newSelectedVariant.image_url
        );
        if (variantImageIndex !== -1) {
          setCurrentImageIndex(variantImageIndex);
        }
      }
    }
  }, [
    selectedColor,
    selectedSize,
    selectedGripSize,
    selectedFrameRacket,
    selectedRacketPiece,
    product,
    allImages,
  ]);

  // Magnifier handlers
  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMagnifierPosition({ x, y });
    setCursorPosition({ x: e.pageX - left, y: e.pageY - top });
  };

  // Image gallery navigation
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Get current image URL
  const getCurrentImage = () => {
    if (allImages.length === 0) return "";
    return allImages[currentImageIndex].image_url;
  };

  // Helper function to check if a variant option is in stock
  const isOptionInStock = (attribute, value, currentFilters = {}) => {
    if (!product) return false;

    // If product is marked as out of stock, all variants are out of stock
    if (product.out_of_stock) return false;

    let filteredVariants = product.variants.filter((v) => {
      // Match the attribute we're checking
      if (v[attribute] !== value) return false;

      // Always apply color filter if a color is selected (for non-color attributes)
      if (attribute !== "color" && selectedColor && v.color !== selectedColor)
        return false;

      // Apply current filters (but not for the attribute we're checking)
      if (
        currentFilters.color &&
        attribute !== "color" &&
        v.color !== currentFilters.color
      )
        return false;
      if (
        currentFilters.size &&
        attribute !== "size" &&
        v.size !== currentFilters.size
      )
        return false;
      if (
        currentFilters.grip_size &&
        attribute !== "grip_size" &&
        v.grip_size !== currentFilters.grip_size
      )
        return false;
      if (
        currentFilters.frame_racket &&
        attribute !== "frame_racket" &&
        v.frame_racket !== currentFilters.frame_racket
      )
        return false;
      if (
        currentFilters.racket_piece &&
        attribute !== "racket_piece" &&
        v.racket_piece !== currentFilters.racket_piece
      )
        return false;

      return true;
    });

    // Check if any variant with this option is in stock
    return filteredVariants.some((v) => v.stock > 0);
  };

  // Helper function to check if all variants for a color are out of stock
  const isColorOutOfStock = (color) => {
    if (!product) return true;

    // If product is marked as out of stock, all colors are out of stock
    if (product.out_of_stock) return true;

    const colorVariants = product.variants.filter((v) => v.color === color);
    return (
      colorVariants.length === 0 || colorVariants.every((v) => v.stock === 0)
    );
  };

  // Helper function to get unique options for a specific attribute with stock info
  const getUniqueOptions = (attribute) => {
    if (!product) return [];

    let variantsToCheck = product.variants;

    // For colors, show ALL colors from all variants (no filtering)
    if (attribute === "color") {
      const values = variantsToCheck
        .map((v) => v[attribute])
        .filter((val) => val != null && val !== "" && val !== "None");
      return [...new Set(values)];
    }

    // For other attributes, filter by selected color if available
    if (selectedColor) {
      variantsToCheck = variantsToCheck.filter(
        (v) => v.color === selectedColor
      );
    }

    // Don't apply other filters when getting options - show all options for the selected color
    // This ensures all sizes/grip sizes are shown even if some are out of stock

    const values = variantsToCheck
      .map((v) => v[attribute])
      .filter((val) => val != null && val !== "" && val !== "None");

    return [...new Set(values)];
  };

  // Get available options for each variant type
  const colors = getUniqueOptions("color");
  const sizes = getUniqueOptions("size");
  const gripSizes = getUniqueOptions("grip_size");
  const frameRacketTypes = getUniqueOptions("frame_racket");
  const racketPieceTypes = getUniqueOptions("racket_piece");

  // Parse the specs JSON string into an object (handle both string and object)
  const specs = product?.specs
    ? typeof product.specs === "string"
      ? JSON.parse(product.specs)
      : product.specs
    : {};

  if (!product)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="loader mx-auto">
            <span className="loader-text">Loading...</span>
          </div>
        </motion.div>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen pt-[30px]">
        <div className="container mx-auto px-4 py-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Left Side: Product Image with Magnifier and Thumbnails */}
            <motion.div
              className="relative"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              {allImages.length > 0 ? (
                <>
                  {/* Main Image with Magnifier */}
                  <div
                    className="relative bg-black rounded-2xl overflow-hidden border border-black cursor-zoom-in group"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <motion.img
                      src={`${API_BASE_URL}${getCurrentImage()}`}
                      alt={product.name}
                      className="w-full h-auto max-h-[600px] object-contain"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 hover:bg-[#ff77bc] backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10 border border-black hover:border-[#ff77bc]"
                          onClick={prevImage}
                          aria-label="Previous image"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 hover:bg-[#ff77bc] backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10 border border-black hover:border-[#ff77bc]"
                          onClick={nextImage}
                          aria-label="Next image"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Magnifier */}
                    <AnimatePresence>
                      {showMagnifier && (
                        <motion.div
                          className="absolute w-64 h-64 border-4 border-white rounded-lg pointer-events-none z-50 shadow-2xl"
                          style={{
                            left: `${cursorPosition.x - 128}px`,
                            top: `${cursorPosition.y - 128}px`,
                            backgroundImage: `url('${API_BASE_URL}${getCurrentImage()}')`,
                            backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                            backgroundSize: "300% 300%",
                            backgroundRepeat: "no-repeat",
                            transform: "translate(-50%, -50%)",
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Image Gallery Thumbnails */}
                  {allImages.length > 1 && (
                    <motion.div
                      className="flex gap-3 mt-6 overflow-x-auto pb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {allImages.map((image, index) => (
                        <motion.button
                          key={index}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            currentImageIndex === index
                              ? "border-[#ff77bc] ring-2 ring-[#ff77bc]/50 shadow-lg shadow-[#ff77bc]/30"
                              : "border-black hover:border-[#70d4fe]"
                          }`}
                          onClick={() => selectImage(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={`${API_BASE_URL}${image.image_url}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {image.is_variant && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                              {image.variant_color}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-[600px] border-2 border-dashed border-black rounded-2xl bg-black/50">
                  <p className="text-white text-lg">
                    No images available for this product
                  </p>
                </div>
              )}
            </motion.div>

            {/* Right Side: Product Details and Variant Selectors */}
            <motion.div
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Product Title */}
              <motion.h1
                className="text-3xl md:text-4xl lg:text-5xl font-black text-white pb-5"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {product.name}
              </motion.h1>

              {/* Price */}
              <motion.div
                className="flex items-center gap-4 flex-wrap"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {selectedVariant ? (
                  <>
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const productDiscount =
                          product.discount_percentage || 0;
                        const variantDiscount =
                          selectedVariant.discount_percentage || 0;
                        // Use the higher discount (variant discount takes precedence if higher)
                        const effectiveDiscount =
                          variantDiscount > productDiscount
                            ? variantDiscount
                            : productDiscount;
                        const hasDiscount = effectiveDiscount > 0;

                        if (hasDiscount) {
                          const discountedPrice =
                            (product.price || 0) *
                            (1 - effectiveDiscount / 100);
                          return (
                            <>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-3xl md:text-4xl font-black text-white">
                                    Rs.{" "}
                                    {Number(discountedPrice).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </span>
                                  <span className="text-xl md:text-2xl font-semibold text-gray-400 line-through">
                                    Rs.{" "}
                                    {Number(product.price || 0).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </span>
                                </div>
                                <motion.span
                                  className={`font-semibold text-sm md:text-base ${
                                    product.out_of_stock ||
                                    selectedVariant.stock === 0
                                      ? "text-red-400"
                                      : "text-green-400"
                                  }`}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  {product.out_of_stock ||
                                  selectedVariant.stock === 0
                                    ? "Out of Stock"
                                    : "In Stock"}
                                </motion.span>
                                <span className="text-xs md:text-sm text-red-400 font-semibold">
                                  Save {effectiveDiscount}% - Limited Time Offer
                                </span>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <span className="text-3xl md:text-4xl font-black text-white">
                                Rs.{" "}
                                {Number(product.price || 0).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </span>
                              <motion.span
                                className={`font-semibold text-sm md:text-base ${
                                  product.out_of_stock ||
                                  selectedVariant.stock === 0
                                    ? "text-red-400"
                                    : "text-green-400"
                                }`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                {product.out_of_stock ||
                                selectedVariant.stock === 0
                                  ? "Out of Stock"
                                  : "In Stock"}
                              </motion.span>
                            </>
                          );
                        }
                      })()}
                      <PaymentOptions
                        product={product}
                        selectedVariant={selectedVariant}
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-xl text-white">
                    Select a variant to see the price
                  </span>
                )}
              </motion.div>

              {/* Color Variants */}
              <motion.div
                className="space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl font-bold text-white">Color</h2>
                <select
                  value={selectedColor || ""}
                  onChange={(e) => {
                    const color = e.target.value;
                    if (color) {
                      setSelectedColor(color);
                      setSelectedSize(null);
                      setSelectedGripSize(null);
                      setSelectedFrameRacket(null);
                      setSelectedRacketPiece(null);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl font-semibold bg-black text-white border-2 border-gray-700 hover:border-[#70d4fe] focus:border-[#ff77bc] focus:outline-none transition-all duration-300"
                  style={{
                    color: "white",
                  }}
                >
                  <option value="">Select Color</option>
                  {colors.map((color) => {
                    const outOfStock = isColorOutOfStock(color);
                    return (
                      <option
                        key={color}
                        value={color}
                        style={
                          outOfStock
                            ? {
                                opacity: 0.5,
                                textDecoration: "line-through",
                                color: "#888",
                              }
                            : {}
                        }
                      >
                        {color} {outOfStock ? "(Out of Stock)" : ""}
                      </option>
                    );
                  })}
                </select>
              </motion.div>

              {/* Size Variants */}
              {sizes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-xl font-bold text-white">Size</h2>
                  <select
                    value={selectedSize || ""}
                    onChange={(e) => {
                      const size = e.target.value;
                      if (size) {
                        setSelectedSize(size);
                        setSelectedGripSize(null);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold bg-black text-white border-2 border-gray-700 hover:border-[#70d4fe] focus:border-[#ff77bc] focus:outline-none transition-all duration-300"
                    style={{
                      color: "white",
                    }}
                  >
                    <option value="">Select Size</option>
                    {sizes.map((size) => {
                      const inStock = isOptionInStock("size", size, {
                        color: selectedColor,
                        grip_size: selectedGripSize,
                        frame_racket: selectedFrameRacket,
                        racket_piece: selectedRacketPiece,
                      });
                      return (
                        <option
                          key={size}
                          value={size}
                          style={
                            !inStock
                              ? {
                                  opacity: 0.5,
                                  textDecoration: "line-through",
                                  color: "#888",
                                }
                              : {}
                          }
                        >
                          {size} {!inStock ? "(Out of Stock)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </motion.div>
              )}

              {/* Grip Size Variants */}
              {gripSizes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h2 className="text-xl font-bold text-white">
                    {product.category === "Shuttlecocks"
                      ? "Speed"
                      : "Grip Size"}
                  </h2>
                  <select
                    value={selectedGripSize || ""}
                    onChange={(e) => {
                      const gripSize = e.target.value;
                      if (gripSize) {
                        setSelectedGripSize(gripSize);
                        setSelectedSize(null);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold bg-black text-white border-2 border-gray-700 hover:border-[#70d4fe] focus:border-[#ff77bc] focus:outline-none transition-all duration-300"
                    style={{
                      color: "white",
                    }}
                  >
                    <option value="">
                      Select{" "}
                      {product.category === "Shuttlecocks"
                        ? "Speed"
                        : "Grip Size"}
                    </option>
                    {gripSizes.map((gripSize) => {
                      const inStock = isOptionInStock("grip_size", gripSize, {
                        color: selectedColor,
                        size: selectedSize,
                        frame_racket: selectedFrameRacket,
                        racket_piece: selectedRacketPiece,
                      });
                      return (
                        <option
                          key={gripSize}
                          value={gripSize}
                          style={
                            !inStock
                              ? {
                                  opacity: 0.5,
                                  textDecoration: "line-through",
                                  color: "#888",
                                }
                              : {}
                          }
                        >
                          {gripSize} {!inStock ? "(Out of Stock)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </motion.div>
              )}

              {/* Frame Racket Variants */}
              {frameRacketTypes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <h2 className="text-xl font-bold text-white">Frame Type</h2>
                  <select
                    value={selectedFrameRacket || ""}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (type) {
                        setSelectedFrameRacket(type);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold bg-black text-white border-2 border-gray-700 hover:border-[#70d4fe] focus:border-[#ff77bc] focus:outline-none transition-all duration-300"
                    style={{
                      color: "white",
                    }}
                  >
                    <option value="">Select Frame Type</option>
                    {frameRacketTypes.map((type) => {
                      const inStock = isOptionInStock("frame_racket", type, {
                        color: selectedColor,
                        size: selectedSize,
                        grip_size: selectedGripSize,
                        racket_piece: selectedRacketPiece,
                      });
                      return (
                        <option
                          key={type}
                          value={type}
                          style={
                            !inStock
                              ? {
                                  opacity: 0.5,
                                  textDecoration: "line-through",
                                  color: "#888",
                                }
                              : {}
                          }
                        >
                          {type} {!inStock ? "(Out of Stock)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </motion.div>
              )}

              {/* Racket Piece Variants */}
              {racketPieceTypes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <h2 className="text-xl font-bold text-white">Piece Type</h2>
                  <select
                    value={selectedRacketPiece || ""}
                    onChange={(e) => {
                      const piece = e.target.value;
                      if (piece) {
                        setSelectedRacketPiece(piece);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold bg-black text-white border-2 border-gray-700 hover:border-[#70d4fe] focus:border-[#ff77bc] focus:outline-none transition-all duration-300"
                    style={{
                      color: "white",
                    }}
                  >
                    <option value="">Select Piece Type</option>
                    {racketPieceTypes.map((piece) => {
                      const inStock = isOptionInStock("racket_piece", piece, {
                        color: selectedColor,
                        size: selectedSize,
                        grip_size: selectedGripSize,
                        frame_racket: selectedFrameRacket,
                      });
                      return (
                        <option
                          key={piece}
                          value={piece}
                          style={
                            !inStock
                              ? {
                                  opacity: 0.5,
                                  textDecoration: "line-through",
                                  color: "#888",
                                }
                              : {}
                          }
                        >
                          {piece} {!inStock ? "(Out of Stock)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Long Description and Specs Table */}
          <motion.div
            className="mt-16 lg:mt-24 max-w-5xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {product.long_description &&
              product.long_description.trim() !== "" && (
                <div className="mb-12">
                  <motion.h2
                    className="text-3xl md:text-4xl font-black text-white mb-6 pb-5"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    Detailed Description
                  </motion.h2>
                  <motion.p
                    className="text-white text-lg leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    {product.long_description}
                  </motion.p>
                </div>
              )}

            {Object.keys(specs).length > 0 && (
              <div className="bg-black rounded-2xl  border border-black">
                <motion.h2
                  className="text-3xl md:text-4xl font-black text-white mb-8 pb-5"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  Specifications
                </motion.h2>
                <motion.div
                  className="overflow-x-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(specs).map(([key, value], index) => (
                        <motion.tr
                          key={key}
                          className="border-b border-black"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            delay: 1.8 + 0.05 * index,
                          }}
                        >
                          <td className="px-6 py-4 bg-gray-800/50 font-bold text-white w-1/3">
                            {key}
                          </td>
                          <td className="px-6 py-4 text-gray-300">{value}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
