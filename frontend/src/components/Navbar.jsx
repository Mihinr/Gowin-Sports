import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle scroll to section when page loads with hash
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 50);
    }
  }, [location]);

  // Smooth scroll to section with offset for navbar
  const scrollToSection = (sectionId) => {
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100; // Adjust based on your navbar height
      const position = section.offsetTop - offset;
      window.scrollTo({ top: position, behavior: "smooth" });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Unified navigation handler
  const handleNavigation = (e, sectionId = "") => {
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToSection(sectionId);
      // Update URL without reload
      window.history.pushState({}, "", `/#${sectionId}`);
    } else {
      navigate(`/#${sectionId}`);
      // Scroll to top when navigating to a different page
      setTimeout(scrollToTop, 100);
    }
    setMenuOpen(false);
    setActiveDropdown(null);
  };

  // Dropdown toggle handler
  const toggleDropdown = (dropdownName, e) => {
    if (window.innerWidth <= 768) e.preventDefault();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.dropdown}`)) {
        setActiveDropdown(null);
      }
      if (!e.target.closest(`.${styles.searchContainer}`)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products`);
      if (response.ok) {
        const data = await response.json();
        // Filter products by name
        const filtered = data.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (product) => {
    const categoryMap = {
      rackets: "rackets",
      shoes: "shoes",
      grips: "grips",
      bags: "bags",
      headbands: "headbands",
      wristbands: "wristbands",
      clothing: "clothing",
      shuttlecocks: "shuttlecocks",
      socks: "socks",
      strings: "strings",
    };
    const category = categoryMap[product.category] || product.category;
    navigate(`/badminton/${category}/${product.slug}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    scrollToTop();
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div
          className={styles.menuBackdrop}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.navContainer}>
          {/* Mobile Menu Toggle - Left */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Logo - Center */}
          <Link
            to="/"
            className={styles.logoContainer}
            onClick={(e) => handleNavigation(e, "")}
          >
            <img
              src="/logo.png"
              alt="Gowin Sports Logo"
              className={styles.logoImage}
            />
            <span className={styles.logoText}>
              <span style={{ color: "#70d4fe" }}>Gowin</span>{" "}
              <span style={{ color: "#ff77bc" }}>Sports</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={styles.desktopNavPlaceholder}>
            <ul className={styles.navLinks}>
              <li>
                <Link to="/" onClick={(e) => handleNavigation(e, "")}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/hotdeals"
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  Hot Deals
                </Link>
              </li>

              {/* Badminton Dropdown */}
              <li
                className={`${styles.dropdown} ${
                  activeDropdown === "badminton" ? "active" : ""
                }`}
              >
                <Link
                  to="#"
                  className={styles.dropbtn}
                  onClick={(e) => toggleDropdown("badminton", e)}
                  onMouseEnter={() =>
                    window.innerWidth > 768 && setActiveDropdown("badminton")
                  }
                >
                  Badminton ▾
                </Link>
                {activeDropdown === "badminton" && (
                  <ul
                    className={styles.dropdownMenu}
                    onMouseLeave={() =>
                      window.innerWidth > 768 && setActiveDropdown(null)
                    }
                  >
                    <li>
                      <Link
                        to="/badminton/rackets"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Rackets
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/shuttlecocks"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Shuttlecocks
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/Strings"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Strings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/grips"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Grips
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/bags"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Bags
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/shoes"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Shoes
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/clothing"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Clothing
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/headbands"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Head Bands
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/wristbands"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Wrist Bands
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/badminton/socks"
                        onClick={() => {
                          setMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Socks
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  to="/about"
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveDropdown(null);
                    scrollToTop();
                  }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveDropdown(null);
                    scrollToTop();
                  }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Search Icon - Rightmost Corner */}
          <div className={styles.searchContainer}>
            <button
              className={styles.searchButton}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search products"
            >
              <FaSearch className={styles.searchIcon} />
            </button>

            {/* Search Dropdown */}
            {searchOpen && (
              <div className={styles.searchDropdown}>
                <div className={styles.searchInputContainer}>
                  <FaSearch className={styles.searchInputIcon} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                <div className={styles.searchResults}>
                  {isSearching ? (
                    <div className={styles.searchLoading}>Searching...</div>
                  ) : searchQuery.trim().length < 2 ? (
                    <div className={styles.searchEmpty}>
                      Type at least 2 characters to search
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className={styles.searchEmpty}>No products found</div>
                  ) : (
                    searchResults.map((product) => (
                      <div
                        key={product.id}
                        className={styles.searchResultItem}
                        onClick={() => handleProductClick(product)}
                      >
                        <img
                          src={product.image_url || "/placeholder.png"}
                          alt={product.name}
                          className={styles.searchResultImage}
                        />
                        <div className={styles.searchResultInfo}>
                          <div className={styles.searchResultName}>
                            {product.name}
                          </div>
                          <div className={styles.searchResultCategory}>
                            {product.category}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Links - Sidebar */}
        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          <li>
            <Link to="/" onClick={(e) => handleNavigation(e, "")}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/hotdeals"
              onClick={() => {
                setMenuOpen(false);
                scrollToTop();
              }}
            >
              Hot Deals
            </Link>
          </li>

          {/* Badminton Dropdown */}
          <li
            className={`${styles.dropdown} ${
              activeDropdown === "badminton" ? "active" : ""
            }`}
          >
            <Link
              to="#"
              className={styles.dropbtn}
              onClick={(e) => toggleDropdown("badminton", e)}
              onMouseEnter={() =>
                window.innerWidth > 768 && setActiveDropdown("badminton")
              }
            >
              Badminton ▾
            </Link>
            {activeDropdown === "badminton" && (
              <ul
                className={styles.dropdownMenu}
                onMouseLeave={() =>
                  window.innerWidth > 768 && setActiveDropdown(null)
                }
              >
                <li>
                  <Link
                    to="/badminton/rackets"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Rackets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/shuttlecocks"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Shuttlecocks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/Strings"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Strings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/grips"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Grips
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/bags"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Bags
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/shoes"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Shoes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/clothing"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Clothing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/headbands"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Head Bands
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/wristbands"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Wrist Bands
                  </Link>
                </li>
                <li>
                  <Link
                    to="/badminton/socks"
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Socks
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/about"
              onClick={() => {
                setMenuOpen(false);
                setActiveDropdown(null);
                scrollToTop();
              }}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              onClick={() => {
                setMenuOpen(false);
                setActiveDropdown(null);
                scrollToTop();
              }}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
