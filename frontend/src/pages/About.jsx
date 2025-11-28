import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useSEO from "../hooks/useSEO";
import {
  FaTrophy,
  FaUsers,
  FaHeart,
  FaAward,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Configuration
  useSEO({
    title: "About Us - Gowin Sports | Your Premier Badminton Equipment Store",
    description:
      "Learn about Gowin Sports, Sri Lanka's premier badminton equipment store. Discover our mission, values, and commitment to providing top-quality badminton gear.",
    keywords:
      "about Gowin Sports, badminton store Sri Lanka, badminton equipment store, Gowin Sports story, badminton shop Colombo",
    url: "/about",
  });

  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full pt-24 pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 pb-2">
                <span className="text-[#70d4fe]">About</span>{" "}
                <span className="text-[#ff77bc]">Us</span>
              </h1>
              <p className="text-xl md:text-2xl text-white font-light">
                Your Premier Destination for Badminton Excellence
              </p>
            </div>
          </div>
        </section>

        {/* Owner Profile Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#ff77bc] shadow-2xl shadow-[#ff77bc]/30">
                    <img
                      src="/profilepic.png"
                      alt="Gowin Sports Owner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x400/70d4fe/ff77bc?text=Gowin+Sports";
                      }}
                    />
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-black mb-4">
                    <span className="text-[white]">Meet the</span>{" "}
                    <span className="text-[white]">Founder</span>
                  </h2>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                    <span className="text-[#70d4fe]">Nalaka N</span>{" "}
                    <span className="text-[#ff77bc]">Amararathne</span>
                  </h3>
                  <p className="text-lg md:text-xl text-white mb-6 leading-relaxed text-justify">
                    Welcome to Gowin Sports! We are passionate about badminton
                    and dedicated to providing the finest badminton equipment to
                    players of all levels. Our mission is to help you achieve
                    your best performance on the court with premium quality gear
                    and expert guidance.
                  </p>
                  <div className="flex justify-center md:justify-start gap-4">
                    <a
                      href="https://www.facebook.com/badmintonstoreinsrilanka"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                      aria-label="Facebook"
                    >
                      <FaFacebook className="text-white text-xl" />
                    </a>
                    <a
                      href="https://www.instagram.com/badmintonstoreinsrilanka"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                      aria-label="Instagram"
                    >
                      <FaInstagram className="text-white text-xl" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Mission */}
                <div className="bg-black rounded-3xl p-8 border border-black">
                  <div className="w-16 h-16 bg-[#70d4fe]/10 rounded-full flex items-center justify-center mb-6">
                    <FaTrophy className="text-[#70d4fe] text-2xl" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4">
                    <span className="text-[#70d4fe]">Our</span>{" "}
                    <span className="text-[#ff77bc]">Mission</span>
                  </h3>
                  <p className="text-white leading-relaxed text-justify">
                    To be Sri Lanka's leading badminton equipment provider,
                    offering premium quality products that enhance player
                    performance and passion for the sport. We strive to make
                    professional-grade equipment accessible to players at every
                    level.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-black rounded-3xl p-8 border border-black">
                  <div className="w-16 h-16 bg-[#ff77bc]/10 rounded-full flex items-center justify-center mb-6">
                    <FaAward className="text-[#ff77bc] text-2xl" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4">
                    <span className="text-[#70d4fe]">Our</span>{" "}
                    <span className="text-[#ff77bc]">Vision</span>
                  </h3>
                  <p className="text-white leading-relaxed text-justify">
                    To inspire and empower badminton enthusiasts across Sri
                    Lanka by providing exceptional products, expert advice, and
                    unwavering support for their badminton journey. We envision
                    a community where every player can reach their full
                    potential.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
                  <span className="text-[#70d4fe]">Our</span>{" "}
                  <span className="text-[#ff77bc]">Values</span>
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Quality */}
                <div className="bg-black rounded-2xl p-6 border border-black text-center">
                  <div className="w-14 h-14 bg-[#70d4fe]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaAward className="text-[#70d4fe] text-xl" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Quality First
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    We source only the finest badminton equipment from trusted
                    manufacturers worldwide, ensuring durability and
                    performance.
                  </p>
                </div>

                {/* Customer Service */}
                <div className="bg-black rounded-2xl p-6 border border-black text-center">
                  <div className="w-14 h-14 bg-[#ff77bc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-[#ff77bc] text-xl" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Customer Focus
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Your satisfaction is our priority. We provide personalized
                    service and expert advice to help you find the perfect
                    equipment.
                  </p>
                </div>

                {/* Passion */}
                <div className="bg-black rounded-2xl p-6 border border-black text-center">
                  <div className="w-14 h-14 bg-[#70d4fe]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHeart className="text-[#70d4fe] text-xl" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Passion for Sport
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    We share your love for badminton and are committed to
                    supporting the growth of the sport in Sri Lanka.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
                  <span className="text-[#70d4fe]">Why Choose</span>{" "}
                  <span className="text-[#ff77bc]">Gowin Sports</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#70d4fe]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaTrophy className="text-[#70d4fe] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      Premium Products
                    </h4>
                    <p className="text-white/80 text-sm">
                      We stock only authentic, high-quality badminton equipment
                      from leading brands.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff77bc]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-[#ff77bc] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      Expert Guidance
                    </h4>
                    <p className="text-white/80 text-sm">
                      Our team provides knowledgeable advice to help you choose
                      the right equipment for your playing style.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#70d4fe]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaAward className="text-[#70d4fe] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      Competitive Prices
                    </h4>
                    <p className="text-white/80 text-sm">
                      We offer the best value for money without compromising on
                      quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff77bc]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaHeart className="text-[#ff77bc] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      Community Support
                    </h4>
                    <p className="text-white/80 text-sm">
                      We actively support local badminton clubs and tournaments,
                      fostering the growth of the sport.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center bg-black rounded-3xl p-8 md:p-12 border border-black">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                <span className="text-[#70d4fe]">Ready to Elevate</span>{" "}
                <span className="text-[#ff77bc]">Your Game?</span>
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Visit our store or contact us to discover the perfect badminton
                equipment for you.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-[#ff77bc] hover:bg-[#ff77bc]/80 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#ff77bc]/50"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
