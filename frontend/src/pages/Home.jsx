import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentOptions from "../components/PaymentOptions";
import useSEO from "../hooks/useSEO";
import { API_BASE_URL } from "../config";

// Store Configuration - Customize this for your store
const STORE_CONFIG = {
  name: "Gowin Sports ",
  tagline: "Gear Up, Play Strong",
  phone: "+94 77 786 4589",
  email: "gowinsports89@gmail.com",
  address: "391/4 samarasinghe mawatha, Thimbirigasyaya Road, Colombo 05",
  googleMapsUrl:
    "https://www.google.com/maps/place/Go~win+sports/data=!4m2!3m1!1s0x0:0x81d589a6df2de70b?sa=X&ved=1t:2428&ictx=111",
};

// Placeholder images using placeholder services
const heroImages = [
  "https://scontent.fcmb1-2.fna.fbcdn.net/v/t39.30808-6/470796645_1055294826351721_3559579164867935760_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=dulwN4-X0UYQ7kNvwHSwUhX&_nc_oc=Adk30uS1q0V-CCZeV4hmT_OzmHLA1gjKUq_guNC3Nk5O_A2mhGPtR2ppNjEj4_Nr9Xo&_nc_zt=23&_nc_ht=scontent.fcmb1-2.fna&_nc_gid=lQDwueKr8St4ZJC4_cnuJA&oh=00_Afh0W6Y9gQRhEvyeCgwZdGzRDnkjloGeUSle1vg9Ew8EPQ&oe=692BC1B3",
  "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwjKkvgNjVRUy7jMnLHHX4rG2s46MX7w-W-blr1Nmq-8ZVLG-vUal-4n5DJOLkIERnDekJJboxse_xfKtBGVTncVsOFoXtrInF252u1MEioBe9aey48pp4_YDXvS0VBwHxD8xLZFw=s680-w680-h510-rw",

  "https://lh3.googleusercontent.com/p/AF1QipOtCPqpLlBlU_7DS9wZxEbqhUiZGpaZ323pf0VL=s680-w680-h510-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwjKkvgNjVRUy7jMnLHHX4rG2s46MX7w-W-blr1Nmq-8ZVLG-vUal-4n5DJOLkIERnDekJJboxse_xfKtBGVTncVsOFoXtrInF252u1MEioBe9aey48pp4_YDXvS0VBwHxD8xLZFw=s680-w680-h510-rw",
];

const productCategories = [
  {
    name: "Shoes",
    image:
      "https://cdn.webshopapp.com/shops/112848/files/470213380/204x204x1/yonex-shb-65z-4-men-white.jpg",
    link: "/badminton/shoes",
    description: "Court domination starts here",
  },
  {
    name: " Racquets",
    image:
      "https://www.directbadminton.co.uk/images/large/Yon_YONAX88DPROBKS3U.jpg",
    link: "/badminton/rackets",
    description: "Precision engineered",
  },
  {
    name: "Grips",
    image: "https://m.media-amazon.com/images/I/61-4FfYdSxL.jpg",
    link: "/badminton/grips",
    description: "Perfect control",
  },
  {
    name: "Bags",
    image:
      "https://res.cloudinary.com/da4mrfwne/image/upload/v1714402566/2024/01/92429EX_BK.jpg",
    link: "/badminton/bags",
    description: "Carry like a pro",
  },
  {
    name: "Headbands",
    image:
      "https://racquetnetwork.com/wp-content/uploads/YONEX-AC258EX-HEADBAND.jpg",
    link: "/badminton/headbands",
    description: "Stay focused",
  },
  {
    name: "Wristbands",
    image:
      "https://www.sportsuncle.com/image/cache/catalog/images/yonex/wristband-ac489-1200x1200.jpg",
    link: "/badminton/wristbands",
    description: "Maximum comfort",
  },
  {
    name: "Clothing",
    image: "https://www.e1981.com/Pic/202308_b/e19811281925429.jpg",
    link: "/badminton/clothing",
    description: "Move without limits",
  },
  {
    name: "Shuttlecocks",
    image:
      "https://i0.wp.com/championsports.com.sg/wp-content/uploads/2025/10/Li-ning-Shuttlecocks-1.webp?fit=800%2C800&ssl=1",
    link: "/badminton/shuttlecocks",
    description: "Professional grade",
  },
  {
    name: "Socks",
    image:
      "https://badmintonworldbalcatta.com/cdn/shop/files/IMG-6567.png?v=1699798759&width=1200",
    link: "/badminton/socks",
    description: "Performance comfort",
  },
  {
    name: "Strings",
    image:
      "https://prokicksports.com/cdn/shop/files/BG80Power_e9981c6d-8f03-4140-b87e-e354170528df.jpg?v=1738326513",
    link: "/badminton/strings",
    description: "Perfect tension",
  },
];

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Configuration
  useSEO({
    title: `${STORE_CONFIG.name} - Premium Badminton Equipment`,
    description: `${STORE_CONFIG.name} offers professional badminton equipment, elite training programs, and world-class coaching. Your journey to championship performance starts here.`,
    keywords: "premium badminton, professional badminton equipment",
    url: "/",
    image: heroImages[0],
  });

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Fetch trending products (highest priced from each category)
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const categories = [
          "rackets",
          "shoes",
          "bags",
          "shuttlecocks",
          "clothing",
        ];
        const allProducts = [];

        // Fetch products from each category
        for (const category of categories) {
          try {
            const response = await fetch(`/api/products/category/${category}`);
            if (response.ok) {
              const products = await response.json();
              // Calculate discounted prices and set min/max prices
              const productsWithPrices = products.map((product) => {
                const basePrice = product.price || 0;
                const productDiscount = product.discount_percentage || 0;
                const hasProductDiscount = productDiscount > 0;

                // Set min_price and max_price from product.price if not already set
                if (!product.min_price && !product.max_price) {
                  product.min_price = basePrice;
                  product.max_price = basePrice;
                }

                const allDiscountedPrices = [];
                let maxDiscount = productDiscount;

                // Add product-level discount if exists
                if (hasProductDiscount) {
                  allDiscountedPrices.push(
                    basePrice * (1 - productDiscount / 100)
                  );
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
                    min_price: product.min_price || basePrice,
                    max_price: product.max_price || basePrice,
                    min_discounted_price:
                      basePrice * (1 - productDiscount / 100),
                    max_discounted_price:
                      basePrice * (1 - productDiscount / 100),
                    min_original_price: basePrice,
                    max_original_price: basePrice,
                    max_discount_percentage: productDiscount,
                    hasDiscount: true,
                  };
                }

                if (allDiscountedPrices.length > 0) {
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
              // Sort by max_price descending and take top items
              const sortedProducts = productsWithPrices
                .sort((a, b) => (b.max_price || 0) - (a.max_price || 0))
                .slice(0, 2); // Take top 2 from each category
              allProducts.push(...sortedProducts);
            }
          } catch (error) {
            console.error(`Error fetching ${category}:`, error);
          }
        }

        // Sort all products by max_price and take top 8
        const sortedAll = allProducts
          .sort((a, b) => (b.max_price || 0) - (a.max_price || 0))
          .slice(0, 8);

        setTrendingProducts(sortedAll);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      }
    };

    fetchTrendingProducts();
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

      <main className="bg-black text-white overflow-hidden">
        {/* Hero Section with Parallax Effect */}
        <section className="relative w-full h-[60vh] md:h-screen overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            effect="fade"
            speed={1000}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-white/30 !w-3 !h-3",
              bulletActiveClass:
                "swiper-pagination-bullet-active !bg-[#ff77bc] !w-8",
            }}
            navigation={true}
            className="w-full h-full [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:bg-white/10 [&_.swiper-button-prev]:bg-white/10 [&_.swiper-button-next]:backdrop-blur-md [&_.swiper-button-prev]:backdrop-blur-md [&_.swiper-button-next]:w-14 [&_.swiper-button-prev]:w-14 [&_.swiper-button-next]:h-14 [&_.swiper-button-prev]:h-14 [&_.swiper-button-next]:rounded-full [&_.swiper-button-prev]:rounded-full hover:[&_.swiper-button-next]:bg-white/20 hover:[&_.swiper-button-prev]:bg-white/20"
          >
            {heroImages.map((src, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-black/60 z-10"></div>
                  <img
                    src={src}
                    alt={`Hero slide ${index + 1}`}
                    className="w-full h-full object-cover scale-110 animate-[zoom_20s_ease-in-out_infinite]"
                  />

                  <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
                    <div className="text-center max-w-5xl">
                      <div className="inline-block mb-3 md:mb-6 px-3 md:px-4 py-1.5 md:py-2 bg-[#ff77bc]/40 backdrop-blur-sm border border-[#ff77bc]/30 rounded-full text-white text-xs md:text-sm font-semibold tracking-wider">
                        PREMIUM BADMINTON EXCELLENCE
                      </div>
                      <h1 className="text-3xl md:text-7xl lg:text-8xl font-black mb-3 md:mb-6 pb-2 md:pb-5 leading-tight">
                        <span className="text-[#70d4fe]">Gowin</span>{" "}
                        <span className="text-[#ff77bc]">Sports</span>
                      </h1>
                      <p className="text-base md:text-2xl lg:text-3xl text-white mb-4 md:mb-10 pb-2 md:pb-5 font-light tracking-wide">
                        {STORE_CONFIG.tagline}
                      </p>
                      <div className="flex justify-center items-center">
                        <a
                          href="#elite-equipment"
                          className="px-6 md:px-10 py-2.5 md:py-5 bg-[#ff77bc] text-white font-bold rounded-full text-sm md:text-lg hover:bg-[#ff77bc]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#ff77bc]/50"
                        >
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  <div className="absolute bottom-4 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
                    <svg
                      className="w-8 h-8 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Products Section with Modern Grid */}
        <section
          id="elite-equipment"
          className="py-24 bg-black relative overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#70d4fe] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff77bc] rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 bg-[#ff77bc]/10 border border-[#ff77bc]/30 rounded-full text-white text-sm font-semibold">
                PREMIUM COLLECTION
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 pb-5">
                <span className="text-[#70d4fe]">Elite</span>{" "}
                <span className="text-[#ff77bc]">Equipment</span>
              </h2>
              <p className="text-xl text-white max-w-2xl mx-auto">
                Professional-grade badminton equipment designed for champions
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {productCategories.map((product, index) => (
                  <Link
                    key={index}
                    to={product.link}
                    className="group block bg-black rounded-2xl p-3 sm:p-4 md:p-6 border border-[#ff77bc] hover:border-[#ff77bc] transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#ff77bc]/20 relative overflow-hidden"
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-[#ff77bc]/0 group-hover:bg-[#ff77bc]/10 transition-all duration-500 rounded-2xl"></div>

                    <div className="relative z-10">
                      <div className="w-full h-32 sm:h-36 md:h-40 mb-3 sm:mb-4 md:mb-5 rounded-xl overflow-hidden bg-black group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 sm:mb-2 group-hover:text-[#ff77bc] transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center text-white  group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-sm font-semibold mr-2">
                          Explore
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Collection Section */}
        <section className="py-24 bg-black relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-10 w-72 h-72 bg-[#ff77bc] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#70d4fe] rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 bg-[#70d4fe]/10 border border-[#70d4fe]/30 rounded-full text-white text-sm font-semibold">
                TRENDING NOW
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 pb-5">
                <span className="text-[#70d4fe]">Trending</span>{" "}
                <span className="text-[#ff77bc]">Collection</span>
              </h2>
              <p className="text-xl text-white max-w-2xl mx-auto">
                Discover our most premium products from top categories
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              {trendingProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {trendingProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group bg-black rounded-2xl overflow-hidden border border-[#70d4fe] hover:border-[#70d4fe] transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-[#70d4fe]/20 hover:-translate-y-2 relative"
                    >
                      {/* Discount Badge */}
                      {product.hasDiscount &&
                        product.max_discount_percentage > 0 && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white font-bold rounded-lg text-xs sm:text-sm shadow-lg">
                            {product.max_discount_percentage}% OFF
                          </div>
                        )}

                      <div className="relative overflow-hidden bg-black">
                        <img
                          src={`${API_BASE_URL}${product.image_url}`}
                          alt={product.name}
                          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div className="p-3 sm:p-4 md:p-5">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 group-hover:text-[#70d4fe] transition-colors">
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
                                <p className="text-base sm:text-lg md:text-xl font-black text-white">
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
                                <p className="text-base sm:text-lg md:text-xl font-black text-white">
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
                          <p className="text-base sm:text-lg md:text-xl font-black text-white">
                            {product.min_price === product.max_price
                              ? `Rs. ${Number(product.min_price).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`
                              : `Rs. ${Number(product.min_price).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )} - Rs. ${Number(
                                  product.max_price
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`}
                          </p>
                        )}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="loader mx-auto">
                    <span className="loader-text">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top Button */}
      <button
        className={`fixed bottom-8 right-8 p-4 bg-[#ff77bc] text-white rounded-full shadow-2xl transition-all duration-300 z-50 hover:scale-110 hover:shadow-[#ff77bc]/50 ${
          isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-5"
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
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
      </button>

      <Footer />
    </>
  );
};

export default Home;
