import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useSEO from "../hooks/useSEO";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const Contact = () => {
  const [selectedStore] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Configuration
  useSEO({
    title: "Contact Us - Gowin Sports | Badminton Store Locations & Hours",
    description:
      "Contact Gowin Sports for badminton equipment inquiries, training sessions, and store information. Visit our stores in Battaramulla, Athurugiriya, and Hokandara.",
    keywords:
      "contact Gowin Sports, badminton store locations, badminton store Sri Lanka, Gowin Sports contact, badminton training booking, store hours",
    url: "/contact",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Gowin Sports",
      telephone: "+94 77 786 4589",
      email: "gowinsports89@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "391/4 samarasinghe mawatha, Thimbirigasyaya Road, Colombo 05",
        addressLocality: "Colombo",
        addressRegion: "Western Province",
        postalCode: "05",
        addressCountry: "LK",
      },
    },
  });

  const stores = [
    {
      name: "Colombo Store",
      address: "391/4 samarasinghe mawatha, Thimbirigasyaya Road, Colombo 05",
      email: "gowinsports89@gmail.com",
      phone: "+94 77 786 4589",
      hours: "Mon-Sun: 9:00 AM - 7:00 PM",
      mapLink:
        "https://www.google.com/maps/place/Go~win+sports/@6.8963821,79.8722059,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae25b0046cb056b:0x81d589a6df2de70b!8m2!3d6.8963821!4d79.8722059!16s%2Fg%2F11wxv99k8d?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.1234567890!2d79.8722059!3d6.8963821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b0046cb056b%3A0x81d589a6df2de70b!2sGo~win+sports!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full pt-24 pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 pb-2">
                <span className="text-[#70d4fe]">Contact</span>{" "}
                <span className="text-[#ff77bc]">Us</span>
              </h1>
              <p className="text-xl md:text-2xl text-white font-light">
                Get in touch with Gowin Sports - We're here to help!
              </p>
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* General Contact Card */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="bg-black rounded-3xl p-8 md:p-12 border border-black shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block mb-4 px-4 py-2 bg-[#ff77bc]/10 border border-[#ff77bc]/30 rounded-full text-white text-sm font-semibold">
                    GET IN TOUCH
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 pb-5">
                    General Inquiries
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Email */}
                  <div className="text-center p-6 bg-black rounded-xl border border-black hover:border-[#ff77bc] transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-[#ff77bc] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaEnvelope className="text-white text-2xl" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Email</h3>
                    <a
                      href="mailto:gowinsports89@gmail.com"
                      className="text-white hover:text-[#70d4fe] transition-colors break-all"
                    >
                      gowinsports89@gmail.com
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="text-center p-6 bg-black rounded-xl border border-black hover:border-[#ff77bc] transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-[#ff77bc] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPhone className="text-white text-2xl" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Phone</h3>
                    <a
                      href="tel:+94777864589"
                      className="text-white hover:text-[#70d4fe] transition-colors"
                    >
                      +94 77 786 4589
                    </a>
                  </div>

                  {/* Address */}
                  <div className="text-center p-6 bg-black rounded-xl border border-black hover:border-[#ff77bc] transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-[#ff77bc] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaMapMarkerAlt className="text-white text-2xl" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Address</h3>
                    <p className="text-white text-sm">
                      391/4 samarasinghe mawatha
                      <br />
                      Thimbirigasyaya Road, Colombo 05
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stores Section */}
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-[#ff77bc]/10 border border-[#ff77bc]/30 rounded-full text-white text-sm font-semibold">
                  OUR LOCATION
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 pb-5">
                  <span className="text-[#70d4fe]">Our</span>{" "}
                  <span className="text-[#ff77bc]">Store</span>
                </h2>
              </div>

              {/* Selected Store Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Store Info Card */}
                <div className="bg-black rounded-3xl p-8 border border-black shadow-2xl">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-6 pb-2 border-b border-black">
                    {stores[selectedStore].name}
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <FaMapMarkerAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-white mb-1">Address</p>
                        <a
                          href={stores[selectedStore].mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-[#70d4fe] transition-colors"
                        >
                          {stores[selectedStore].address}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <FaPhone className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-white mb-1">Phone</p>
                        <a
                          href={`tel:${stores[selectedStore].phone.replace(
                            /\s/g,
                            ""
                          )}`}
                          className="text-white hover:text-[#70d4fe] transition-colors"
                        >
                          {stores[selectedStore].phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <FaEnvelope className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-white mb-1">Email</p>
                        <a
                          href={`mailto:${stores[selectedStore].email}`}
                          className="text-white hover:text-[#70d4fe] transition-colors break-all"
                        >
                          {stores[selectedStore].email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <FaClock className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-white mb-1">Hours</p>
                        <p className="text-white">
                          {stores[selectedStore].hours}
                        </p>
                      </div>
                    </div>

                    <a
                      href={stores[selectedStore].mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full mt-6 px-6 py-4 bg-[#ff77bc] text-white font-bold rounded-xl text-center hover:shadow-lg hover:shadow-[#ff77bc]/50 transition-all duration-300 hover:scale-105"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="bg-black rounded-3xl overflow-hidden border border-black shadow-2xl">
                  <div className="relative w-full h-full min-h-[400px]">
                    <iframe
                      src={stores[selectedStore].mapEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "400px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                      title={`${stores[selectedStore].name} Location`}
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-black">
                        <p className="text-white font-semibold text-sm">
                          {stores[selectedStore].name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Us Section */}
              <div className="max-w-4xl mx-auto mt-12">
                <div className="bg-black rounded-6xl p-8 md:p-12 border border-black shadow-2xl">
                  <div className="text-center">
                    <p className="text-white mb-6 text-4xl font-semibold">
                      Follow Us
                    </p>
                    <div className="flex justify-center gap-4">
                      <a
                        href="https://www.facebook.com/share/1BMjnNX1Uv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                        aria-label="Facebook"
                      >
                        <FaFacebook className="text-white text-5xl" />
                      </a>
                      <a
                        href="https://www.instagram.com/winnersbadmintonacademy?igsh=MXQ4OXN0aHh4cnc1cA=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 bg-black hover:bg-[#ff77bc] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff77bc]/50"
                        aria-label="Instagram"
                      >
                        <FaInstagram className="text-white text-5xl" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
