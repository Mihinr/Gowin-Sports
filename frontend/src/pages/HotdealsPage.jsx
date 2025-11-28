import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentOptions from "../components/PaymentOptions";
import useSEO from "../hooks/useSEO";
import { API_BASE_URL } from "../config";
import axios from "axios";

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

const HotdealsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerImages, setBannerImages] = useState([]);
  const navigate = useNavigate();

  // SEO Configuration
  useSEO({
    title: "Hot Deals - Gowin Sports | Discounted Badminton Equipment",
    description:
      "Discover amazing deals on premium badminton equipment at Gowin Sports. Shop discounted rackets, shoes, bags, and more!",
    keywords: "hot deals, discounts, badminton equipment, sale, gowin sports",
    url: "/hotdeals",
  });

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setIsLoading(true);
        const categories = [
          "rackets",
          "shoes",
          "bags",
          "shuttlecocks",
          "clothing",
          "grips",
          "headbands",
          "wristbands",
          "strings",
        ];

        const allProducts = [];

        // Fetch products from each category
        for (const category of categories) {
          try {
            const response = await fetch(`/api/products/category/${category}`);
            if (response.ok) {
              const categoryProducts = await response.json();
              allProducts.push(...categoryProducts);
            }
          } catch (error) {
            console.error(`Error fetching ${category}:`, error);
          }
        }

        // Filter products that have product-level discount or at least one variant with discount
        const discountedProducts = allProducts.filter((product) => {
          const productDiscount = product.discount_percentage || 0;
          if (productDiscount > 0) return true;

          if (!product.variants || product.variants.length === 0) return false;
          return product.variants.some(
            (v) => v.discount_percentage && v.discount_percentage > 0
          );
        });

        // Calculate discounted prices for each product
        const productsWithDiscounts = discountedProducts.map((product) => {
          const basePrice = product.price || 0;
          const productDiscount = product.discount_percentage || 0;
          const hasProductDiscount = productDiscount > 0;

          const allDiscountedPrices = [];
          const allOriginalPrices = [];
          let maxDiscount = productDiscount;

          // Add product-level discount
          if (hasProductDiscount) {
            allDiscountedPrices.push(basePrice * (1 - productDiscount / 100));
            allOriginalPrices.push(basePrice);
          }

          // Add variant-level discounts
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
                allDiscountedPrices.push(
                  basePrice * (1 - effectiveDiscount / 100)
                );
                allOriginalPrices.push(basePrice);
                if (variantDiscount > maxDiscount) {
                  maxDiscount = variantDiscount;
                }
              });
          }

          // If no variants but has product discount
          if (
            hasProductDiscount &&
            (!product.variants || product.variants.length === 0)
          ) {
            return {
              ...product,
              min_discounted_price: basePrice * (1 - productDiscount / 100),
              max_discounted_price: basePrice * (1 - productDiscount / 100),
              min_original_price: basePrice,
              max_original_price: basePrice,
              max_discount_percentage: productDiscount,
            };
          }

          return {
            ...product,
            min_discounted_price:
              allDiscountedPrices.length > 0
                ? Math.min(...allDiscountedPrices)
                : basePrice,
            max_discounted_price:
              allDiscountedPrices.length > 0
                ? Math.max(...allDiscountedPrices)
                : basePrice,
            min_original_price:
              allOriginalPrices.length > 0
                ? Math.min(...allOriginalPrices)
                : basePrice,
            max_original_price:
              allOriginalPrices.length > 0
                ? Math.max(...allOriginalPrices)
                : basePrice,
            max_discount_percentage: maxDiscount,
          };
        });

        // Sort by discount percentage (highest first)
        productsWithDiscounts.sort(
          (a, b) => b.max_discount_percentage - a.max_discount_percentage
        );

        setProducts(productsWithDiscounts);
        setFilteredProducts(productsWithDiscounts);
      } catch (error) {
        console.error("Error fetching discounted products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/banners`);
        console.log("Banners fetched:", response.data);
        setBannerImages(response.data || []);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBannerImages([]);
      }
    };

    fetchBanners();
  }, []);

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
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section with Banner */}
        <section className="relative pt-16 pb-8 md:py-20 bg-gradient-to-br from-[#ff77bc]/20 via-black to-[#70d4fe]/20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#70d4fe] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff77bc] rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Header Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4 px-4 py-2 bg-[#ff77bc]/40 backdrop-blur-sm border border-[#ff77bc]/30 rounded-full text-white text-sm font-semibold tracking-wider"
                >
                  ⏱️ LIMITED TIME OFFER
                </motion.div>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 lg:mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="text-[#70d4fe]">Hot</span>{" "}
                  <span className="text-[#ff77bc]">Deals</span>
                </motion.h1>
                <motion.p
                  className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Exclusive discounts on premium badminton equipment. Don't miss
                  out on these amazing deals!
                </motion.p>
              </div>

              {/* Promotional Banner Carousel */}
              <div className="w-full">
                {bannerImages.length > 0 ? (
                  <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    navigation={true}
                    loop={bannerImages.length > 1}
                    className="banner-swiper w-full"
                  >
                    {bannerImages.map((banner) => (
                      <SwiperSlide key={banner.id}>
                        <div className="relative w-full overflow-hidden flex items-center justify-center bg-black rounded-lg">
                          <img
                            src={`${API_BASE_URL}${banner.image_url}`}
                            alt={`Promotional banner ${banner.id}`}
                            className="w-full h-auto max-h-[300px] md:max-h-[350px] lg:max-h-[400px] object-contain"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="w-full h-48 md:h-64 lg:h-80 bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-center px-4">
                      No promotional banners available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 md:py-24 bg-black">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-[#70d4fe] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading hot deals...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  className="w-20 h-20 mx-auto mb-4 fill-gray-600"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-xl text-gray-400">
                  No hot deals available at the moment
                </p>
                <p className="text-gray-500 mt-2">
                  Check back soon for amazing discounts!
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
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
                    {product.max_discount_percentage > 0 && (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-3 sm:p-4 md:p-5">
                      <h3 className="text-sm sm:text-base font-bold text-[#70d4fe] mb-1.5 sm:mb-2 line-clamp-2 transition-colors">
                        {product.name}
                      </h3>
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
                        <PaymentOptions product={product} />
                      </div>
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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HotdealsPage;
