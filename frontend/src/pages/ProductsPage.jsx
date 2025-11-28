import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentOptions from "../components/PaymentOptions";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import useSEO from "../hooks/useSEO";
import { API_BASE_URL } from "../config";

const bannerImages = {
  rackets:
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1920&h=600&fit=crop",
  shuttlecocks:
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&h=600&fit=crop",
  Strings:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=600&fit=crop",
  grips:
    "https://images.unsplash.com/photo-1622163642999-4f7c79ebf52b?w=1920&h=600&fit=crop",
  bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=600&fit=crop",
  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=600&fit=crop",
  clothing:
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1920&h=600&fit=crop",
  headbands:
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1920&h=600&fit=crop",
  wristbands:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=600&fit=crop",
  socks:
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1920&h=600&fit=crop",
};

const defaultBanner =
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1920&h=600&fit=crop";

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
      stiffness: 100,
      damping: 10,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const categoryTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minMaxPrice, setMinMaxPrice] = useState([0, 1000]);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [prevCategory, setPrevCategory] = useState(category);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic variant filters
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGripSizes, setSelectedGripSizes] = useState([]);
  const [selectedFrameRackets, setSelectedFrameRackets] = useState([]);
  const [selectedRacketPieces, setSelectedRacketPieces] = useState([]);

  // Stock status filter
  const [stockStatusFilter, setStockStatusFilter] = useState("all"); // "all", "inStock", "outOfStock"

  // Category name mapping for SEO
  const categoryNames = {
    rackets: "Badminton Rackets",
    shoes: "Badminton Shoes",
    grips: "Badminton Grips",
    bags: "Badminton Bags",
    headbands: "Badminton Headbands",
    wristbands: "Badminton Wristbands",
    clothing: "Badminton Clothing",
    shuttlecocks: "Badminton Shuttlecocks",
    socks: "Badminton Socks",
    strings: "Badminton Strings",
  };

  const categoryName = categoryNames[category] || category;

  // SEO Configuration
  useSEO({
    title: `${categoryName} - Gowin Sports | Premium Badminton Equipment`,
    description: `Shop premium ${categoryName.toLowerCase()} at Gowin Sports. Browse our extensive collection of high-quality badminton equipment.`,
    keywords: `${categoryName}, badminton ${category}, badminton equipment, ${category} Sri Lanka, Gowin Sports, badminton store`,
    url: `/badminton/${category}`,
    image: bannerImages[category] || defaultBanner,
  });

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const resetAllFilters = () => {
    setSelectedCollection("All");
    setSelectedType("All");
    setPriceRange(minMaxPrice);
    setSortOption("default");
    setSearchQuery("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedGripSizes([]);
    setSelectedFrameRackets([]);
    setSelectedRacketPieces([]);
    setStockStatusFilter("all");
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const url = `/api/products/category/${category}?collection=${selectedCollection}&type=${selectedType}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      // Calculate discounted prices for products with discounts and set min/max prices
      const productsWithDiscounts = data.map((product) => {
        // Set min_price and max_price from product.price if not already set
        const basePrice = product.price || 0;
        if (!product.min_price && !product.max_price) {
          product.min_price = basePrice;
          product.max_price = basePrice;
        }

        const productDiscount = product.discount_percentage || 0;
        const hasProductDiscount = productDiscount > 0;

        if (!product.variants || product.variants.length === 0) {
          // No variants - check product-level discount
          if (hasProductDiscount) {
            const discountedPrice = basePrice * (1 - productDiscount / 100);
            return {
              ...product,
              min_price: product.min_price || basePrice,
              max_price: product.max_price || basePrice,
              min_discounted_price: discountedPrice,
              max_discounted_price: discountedPrice,
              min_original_price: basePrice,
              max_original_price: basePrice,
              max_discount_percentage: productDiscount,
              hasDiscount: true,
            };
          }
          return {
            ...product,
            min_price: product.min_price || basePrice,
            max_price: product.max_price || basePrice,
          };
        }

        const discountedVariants = product.variants.filter(
          (v) => v.discount_percentage && v.discount_percentage > 0
        );

        // Check if product has product-level discount or variant-level discounts
        if (hasProductDiscount || discountedVariants.length > 0) {
          const allDiscountedPrices = [];
          let maxDiscount = productDiscount;

          // Add product-level discount
          if (hasProductDiscount) {
            allDiscountedPrices.push(basePrice * (1 - productDiscount / 100));
          }

          // Add variant-level discounts
          if (discountedVariants.length > 0) {
            discountedVariants.forEach((v) => {
              const variantDiscount = v.discount_percentage || 0;
              // Use variant discount if it's higher than product discount, otherwise use product discount
              const effectiveDiscount =
                variantDiscount > productDiscount
                  ? variantDiscount
                  : productDiscount;
              allDiscountedPrices.push(
                basePrice * (1 - effectiveDiscount / 100)
              );
              if (variantDiscount > maxDiscount) {
                maxDiscount = variantDiscount;
              }
            });
          }

          return {
            ...product,
            min_price: product.min_price || basePrice,
            max_price: product.max_price || basePrice,
            min_discounted_price: Math.min(...allDiscountedPrices),
            max_discounted_price: Math.max(...allDiscountedPrices),
            min_original_price: basePrice,
            max_original_price: basePrice,
            max_discount_percentage: maxDiscount,
            hasDiscount: true,
          };
        }

        return {
          ...product,
          min_price: product.min_price || basePrice,
          max_price: product.max_price || basePrice,
        };
      });

      setProducts(productsWithDiscounts);
      applyAllFilters(productsWithDiscounts);
      updatePriceRange(productsWithDiscounts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePriceRange = (products) => {
    if (products.length === 0) return;
    const minPrice = Math.min(...products.map((product) => product.min_price));
    const maxPrice = Math.max(...products.map((product) => product.max_price));
    setMinMaxPrice([minPrice, maxPrice]);
    setPriceRange([minPrice, maxPrice]);
  };

  const filterProductsByPriceRange = (range) => {
    setPriceRange(range);
    applyAllFilters();
  };

  const handlePriceRangeChange = (value) => {
    filterProductsByPriceRange(value);
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch(`/api/collections/${category}`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch(`/api/types/${category}`);
      if (!response.ok) throw new Error("Failed to fetch types");
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applySearchFilter(products);
  };

  // Helper function to check if a product is in stock
  const isProductInStock = (product) => {
    // If product is marked as out of stock, it's out of stock
    if (product.out_of_stock) return false;

    // Check if any variant has stock > 0
    if (product.variants && product.variants.length > 0) {
      return product.variants.some((v) => v.stock > 0);
    }

    // If no variants, consider it in stock (or you can change this logic)
    return true;
  };

  // Extract unique variant values from products
  const getUniqueVariantValues = (attribute) => {
    const values = new Set();
    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          const value = variant[attribute];
          if (value && value !== "None" && value !== "" && value != null) {
            values.add(value);
          }
        });
      }
    });
    return Array.from(values).sort();
  };

  // Apply all filters including variant filters
  const applyAllFilters = (productsToFilter = products) => {
    let filtered = [...productsToFilter];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.min_price >= priceRange[0] && product.max_price <= priceRange[1]
    );

    // Apply stock status filter
    if (stockStatusFilter !== "all") {
      filtered = filtered.filter((product) => {
        const inStock = isProductInStock(product);
        return stockStatusFilter === "inStock" ? inStock : !inStock;
      });
    }

    // Apply variant filters
    if (selectedColors.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some((v) => selectedColors.includes(v.color))
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some((v) => selectedSizes.includes(v.size))
      );
    }

    if (selectedGripSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some((v) => selectedGripSizes.includes(v.grip_size))
      );
    }

    if (selectedFrameRackets.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some((v) =>
          selectedFrameRackets.includes(v.frame_racket)
        )
      );
    }

    if (selectedRacketPieces.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some((v) =>
          selectedRacketPieces.includes(v.racket_piece)
        )
      );
    }

    setFilteredProducts(filtered);
  };

  const applySearchFilter = (productsToFilter) => {
    applyAllFilters(productsToFilter);
  };

  useEffect(() => {
    if (prevCategory !== category) {
      setSelectedCollection("All");
      setSelectedType("All");
      setSortOption("default");
      setSearchQuery("");
      setSelectedColors([]);
      setSelectedSizes([]);
      setSelectedGripSizes([]);
      setSelectedFrameRackets([]);
      setSelectedRacketPieces([]);
      setStockStatusFilter("all");
      setPrevCategory(category);
    }
    fetchCollections();
    fetchTypes();
    fetchProducts();
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCollection, selectedType]);

  useEffect(() => {
    if (products.length > 0) {
      applyAllFilters();
    }
  }, [
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedGripSizes,
    selectedFrameRackets,
    selectedRacketPieces,
    priceRange,
    stockStatusFilter,
    products,
  ]);

  const handleCollectionChange = (collection) => {
    setSelectedCollection(collection);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const sortProducts = (option) => {
    let sortedProducts = [...filteredProducts];
    switch (option) {
      case "a-z":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-low-high":
        sortedProducts.sort((a, b) => a.min_price - b.min_price);
        break;
      case "price-high-low":
        sortedProducts.sort((a, b) => b.max_price - a.max_price);
        break;
      default:
        break;
    }
    setFilteredProducts(sortedProducts);
  };

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    sortProducts(option);
  };

  const handleProductClick = (product) => {
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="bg-black min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={categoryTransition}
      >
        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            className="w-full"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={categoryTransition}
          >
            <div className="container mx-auto px-4 pt-24 pb-6">
              <motion.h1
                key={`${category}-title`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-black text-center"
              >
                <span className="text-[#70d4fe]">Badminton</span>{" "}
                <span className="text-[#ff77bc]">
                  {categoryName.replace("Badminton ", "")}
                </span>
              </motion.h1>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Mobile Filter Backdrop */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <motion.aside
              className={`lg:w-64 flex-shrink-0 ${
                isFilterOpen
                  ? "fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto bg-black lg:bg-transparent overflow-y-auto"
                  : "hidden lg:block"
              }`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className={`bg-black rounded-2xl p-6 border border-black ${
                  isFilterOpen ? "m-4 lg:m-0" : ""
                } lg:sticky lg:top-24`}
              >
                {/* Mobile Filter Close Button */}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden w-full mb-4 px-4 py-2 bg-[#ff77bc] hover:bg-[#70d4fe] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Close Filters
                </button>

                <button
                  onClick={resetAllFilters}
                  className="w-full mb-6 px-4 py-2 bg-black hover:bg-[#ff77bc] text-white font-semibold rounded-lg border border-black hover:border-[#ff77bc] transition-all duration-300"
                >
                  Reset All Filters
                </button>

                {/* Collections */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                    Collections
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCollectionChange("All")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                        selectedCollection === "All"
                          ? "bg-[#ff77bc] text-white shadow-lg shadow-[#ff77bc]/50"
                          : "bg-black text-white hover:bg-[#70d4fe] hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    {collections.map((collection) => (
                      <button
                        key={collection}
                        onClick={() => handleCollectionChange(collection)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                          selectedCollection === collection
                            ? "bg-[#70d4fe] text-white shadow-lg shadow-[#70d4fe]/50"
                            : "bg-black text-white hover:bg-[#70d4fe] hover:text-white"
                        }`}
                      >
                        {collection}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                    Price Range
                  </h3>
                  <div className="px-2 mb-4">
                    <Slider
                      range
                      min={minMaxPrice[0]}
                      max={minMaxPrice[1]}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      trackStyle={[{ backgroundColor: "#ff77bc", height: 6 }]}
                      handleStyle={[
                        {
                          backgroundColor: "#ff77bc",
                          borderColor: "#ff77bc",
                          width: 20,
                          height: 20,
                        },
                        {
                          backgroundColor: "#ff77bc",
                          borderColor: "#ff77bc",
                          width: 20,
                          height: 20,
                        },
                      ]}
                      railStyle={{ backgroundColor: "#000000", height: 6 }}
                    />
                  </div>
                  <div className="flex justify-between text-white text-sm">
                    <span className="bg-black px-3 py-1 rounded-lg">
                      Rs. {priceRange[0].toLocaleString()}
                    </span>
                    <span className="bg-black px-3 py-1 rounded-lg">
                      Rs. {priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Stock Status Filter */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                    Stock
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockStatusFilter === "all"}
                        onChange={() => setStockStatusFilter("all")}
                        className="w-5 h-5 text-[#70d4fe] bg-black border-2 border-white rounded focus:ring-[#70d4fe] focus:ring-2 cursor-pointer checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                      />
                      <span className="ml-3 text-white">All Products</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockStatusFilter === "inStock"}
                        onChange={() =>
                          setStockStatusFilter(
                            stockStatusFilter === "inStock" ? "all" : "inStock"
                          )
                        }
                        className="w-5 h-5 text-[#70d4fe] bg-black border-2 border-white rounded focus:ring-[#70d4fe] focus:ring-2 cursor-pointer checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                      />
                      <span className="ml-3 text-white">In Stock</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockStatusFilter === "outOfStock"}
                        onChange={() =>
                          setStockStatusFilter(
                            stockStatusFilter === "outOfStock"
                              ? "all"
                              : "outOfStock"
                          )
                        }
                        className="w-5 h-5 text-[#70d4fe] bg-black border-2 border-white rounded focus:ring-[#70d4fe] focus:ring-2 cursor-pointer checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                      />
                      <span className="ml-3 text-white">Out of Stock</span>
                    </label>
                  </div>
                </div>

                {/* Types */}
                {types.length > 1 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                      Types
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleTypeChange("All")}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                          selectedType === "All"
                            ? "bg-[#ff77bc] text-white shadow-lg shadow-[#ff77bc]/50"
                            : "bg-black text-white hover:bg-[#70d4fe] hover:text-white"
                        }`}
                      >
                        All
                      </button>
                      {types.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                            selectedType === type
                              ? "bg-[#70d4fe] text-white shadow-lg shadow-[#70d4fe]/50"
                              : "bg-black text-white hover:bg-[#70d4fe] hover:text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Variant Filters */}
                {products.length > 0 &&
                  (() => {
                    const colors = getUniqueVariantValues("color");
                    const sizes = getUniqueVariantValues("size");
                    const gripSizes = getUniqueVariantValues("grip_size");
                    const frameRackets = getUniqueVariantValues("frame_racket");
                    const racketPieces = getUniqueVariantValues("racket_piece");

                    const toggleFilter = (
                      filterArray,
                      setFilterArray,
                      value
                    ) => {
                      if (filterArray.includes(value)) {
                        setFilterArray(
                          filterArray.filter((item) => item !== value)
                        );
                      } else {
                        setFilterArray([...filterArray, value]);
                      }
                    };

                    return (
                      <>
                        {/* Colors Filter */}
                        {colors.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                              Colors
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {colors.map((color) => (
                                <label
                                  key={color}
                                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedColors.includes(color)}
                                    onChange={() =>
                                      toggleFilter(
                                        selectedColors,
                                        setSelectedColors,
                                        color
                                      )
                                    }
                                    className="w-4 h-4 text-[#ff77bc] bg-black border-2 border-white rounded focus:ring-[#ff77bc] focus:ring-2 checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                                  />
                                  <span className="ml-3 text-white">
                                    {color}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sizes Filter */}
                        {sizes.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                              Sizes
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {sizes.map((size) => (
                                <label
                                  key={size}
                                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSizes.includes(size)}
                                    onChange={() =>
                                      toggleFilter(
                                        selectedSizes,
                                        setSelectedSizes,
                                        size
                                      )
                                    }
                                    className="w-4 h-4 text-[#ff77bc] bg-black border-2 border-white rounded focus:ring-[#ff77bc] focus:ring-2 checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                                  />
                                  <span className="ml-3 text-white">
                                    {size}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Grip Sizes Filter */}
                        {gripSizes.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                              Grip Sizes / Speed
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {gripSizes.map((gripSize) => (
                                <label
                                  key={gripSize}
                                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedGripSizes.includes(
                                      gripSize
                                    )}
                                    onChange={() =>
                                      toggleFilter(
                                        selectedGripSizes,
                                        setSelectedGripSizes,
                                        gripSize
                                      )
                                    }
                                    className="w-4 h-4 text-[#ff77bc] bg-black border-2 border-white rounded focus:ring-[#ff77bc] focus:ring-2 checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                                  />
                                  <span className="ml-3 text-white">
                                    {gripSize}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Frame Racket Filter */}
                        {frameRackets.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                              Frame Type
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {frameRackets.map((frameRacket) => (
                                <label
                                  key={frameRacket}
                                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedFrameRackets.includes(
                                      frameRacket
                                    )}
                                    onChange={() =>
                                      toggleFilter(
                                        selectedFrameRackets,
                                        setSelectedFrameRackets,
                                        frameRacket
                                      )
                                    }
                                    className="w-4 h-4 text-[#ff77bc] bg-black border-2 border-white rounded focus:ring-[#ff77bc] focus:ring-2 checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                                  />
                                  <span className="ml-3 text-white">
                                    {frameRacket}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Racket Piece Filter */}
                        {racketPieces.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-black">
                              Piece Type
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {racketPieces.map((racketPiece) => (
                                <label
                                  key={racketPiece}
                                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedRacketPieces.includes(
                                      racketPiece
                                    )}
                                    onChange={() =>
                                      toggleFilter(
                                        selectedRacketPieces,
                                        setSelectedRacketPieces,
                                        racketPiece
                                      )
                                    }
                                    className="w-4 h-4 text-[#ff77bc] bg-black border-2 border-white rounded focus:ring-[#ff77bc] focus:ring-2 checked:bg-black checked:border-white appearance-none checked:appearance-auto"
                                  />
                                  <span className="ml-3 text-white">
                                    {racketPiece}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Search, Sort, and Filter Bar */}
              <motion.div
                className="flex flex-col md:flex-row gap-4 mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={categoryTransition}
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-black rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#ff77bc] focus:border-transparent transition-all duration-300"
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  {/* Filter Button - Mobile Only */}
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden px-4 py-4 bg-[#ff77bc] hover:bg-[#70d4fe] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    aria-label="Toggle filters"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                  <label
                    htmlFor="sort"
                    className="text-white font-semibold whitespace-nowrap"
                  >
                    Sort By:
                  </label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="px-6 py-4 bg-black border border-black rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#ff77bc] focus:border-transparent transition-all duration-300 cursor-pointer"
                  >
                    <option value="default" className="bg-black">
                      Default
                    </option>
                    <option value="a-z" className="bg-gray-900">
                      A-Z
                    </option>
                    <option value="z-a" className="bg-gray-900">
                      Z-A
                    </option>
                    <option value="price-low-high" className="bg-gray-900">
                      Price: Low to High
                    </option>
                    <option value="price-high-low" className="bg-gray-900">
                      Price: High to Low
                    </option>
                  </select>
                </div>
              </motion.div>

              {/* Products Count */}
              <div className="mb-6">
                <p className="text-white">
                  Showing{" "}
                  <span className="text-white font-semibold">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="loader mx-auto">
                      <span className="loader-text">Loading...</span>
                    </div>
                  </motion.div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="text-white text-xl mb-4">
                      No products found
                    </div>
                    <p className="text-white">Try adjusting your filters</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${category}-products`}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    transition={categoryTransition}
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="group bg-black rounded-2xl overflow-hidden border border-[#ff77bc] hover:border-[#ff77bc] transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-[#ff77bc]/20 relative"
                      >
                        {/* Discount Badge */}
                        {product.hasDiscount &&
                          product.max_discount_percentage > 0 && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white font-bold rounded-lg text-xs sm:text-sm shadow-lg">
                              {product.max_discount_percentage}% OFF
                            </div>
                          )}

                        <div className="relative overflow-hidden bg-black">
                          <motion.img
                            src={`${API_BASE_URL}${product.image_url}`}
                            alt={product.name}
                            className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div className="absolute inset-0  group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5">
                          <h3 className="text-sm sm:text-base font-bold text-[#70d4fe] mb-1.5 sm:mb-2 line-clamp-2 transition-colors">
                            {product.name}
                          </h3>
                          {product.hasDiscount ? (
                            <div className="space-y-1">
                              {product.min_discounted_price ===
                              product.max_discounted_price ? (
                                <div>
                                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                                    Rs.{" "}
                                    {Number(
                                      product.min_original_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                  <p className="text-base sm:text-lg font-black text-white">
                                    Rs.{" "}
                                    {Number(
                                      product.min_discounted_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                                    Rs.{" "}
                                    {Number(
                                      product.min_original_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                    - Rs.{" "}
                                    {Number(
                                      product.max_original_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                  <p className="text-base sm:text-lg font-black text-white">
                                    Rs.{" "}
                                    {Number(
                                      product.min_discounted_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                    - Rs.{" "}
                                    {Number(
                                      product.max_discounted_price
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-lg font-black text-white">
                              {product.min_price === product.max_price
                                ? `Rs. ${Number(
                                    product.min_price
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : `Rs. ${Number(
                                    product.min_price
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })} - Rs. ${Number(
                                    product.max_price
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`}
                            </p>
                          )}
                          <PaymentOptions product={product} />
                          <div className="mt-4 flex items-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="text-sm font-semibold mr-2">
                              View Details
                            </span>
                            <svg
                              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />

      {/* Back to Top Button */}
      <motion.button
        className={`fixed bottom-8 right-8 p-4 bg-[#ff77bc] text-white rounded-full shadow-2xl transition-all duration-300 z-50 hover:scale-110 hover:shadow-[#ff77bc]/50 ${
          isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-5"
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
            d="M5 15l7-7 7 7"
          />
        </svg>
      </motion.button>
    </>
  );
};

export default ProductsPage;
