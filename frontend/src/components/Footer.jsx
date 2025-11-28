import {
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaFacebook,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#70d4fe] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#ff77bc] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Gowin Sports Logo"
                className="h-16 md:h-20 mb-4 filter "
              />
              <h2 className="text-2xl font-black mb-2">
                <span className="text-[#70d4fe]">Gowin</span>{" "}
                <span className="text-[#ff77bc]">Sports</span>
              </h2>
              <p className="text-[#70d4fe] font-light">Gear Up, Play Strong</p>
            </div>
            <p className="text-white text-sm leading-relaxed mb-6">
              Your ultimate destination for high-performance badminton equipment
            </p>

            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/badmintonstoreinsrilanka"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                aria-label="Facebook"
              >
                <FaFacebook className="text-white" />
              </a>
              <a
                href="https://www.instagram.com/gowin_sports/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                aria-label="Instagram"
              >
                <FaInstagram className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/rackets"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Products
                </Link>
              </li>
            </ul>
          </div>
          {/* Products */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Products</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              <li>
                <Link
                  to="/badminton/rackets"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Rackets
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/shoes"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Shoes
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/bags"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Bags
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/shuttlecocks"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Shuttlecocks
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/clothing"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/grips"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Grips
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/headbands"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Headbands
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/wristbands"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Wristbands
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/socks"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Socks
                </Link>
              </li>
              <li>
                <Link
                  to="/badminton/Strings"
                  onClick={scrollToTop}
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-[#ff77bc] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Strings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm leading-relaxed">
                    391/4 samarasinghe mawatha,
                    <br />
                    Thimbirigasyaya Road, Colombo 05, Sri Lanka
                  </p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <FaPhone className="text-white" />
                </div>
                <a
                  href="tel:+94777864589"
                  className="text-white hover:text-[#70d4fe] transition-colors duration-300"
                >
                  +94 77 786 4589
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <FaEnvelope className="text-white" />
                </div>
                <a
                  href="mailto:gowinsports89@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors duration-300 break-all"
                >
                  gowinsports89@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black "></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm text-center md:text-left">
            © {currentYear}{" "}
            <span className="font-semibold">
              <span className="text-[#70d4fe]">Gowin</span>{" "}
              <span className="text-[#ff77bc]">Sports</span>
            </span>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white text-sm">
            <span>Developed by</span>
            <a
              href="https://codeyardlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#70d4fe] font-semibold transition-colors duration-300 hover:underline"
            >
              Codeyard Labs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
