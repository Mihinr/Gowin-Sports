import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminPanel from "./pages/AdminPanel";
import HotdealsPage from "./pages/HotdealsPage";

// ScrollToTop component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
            {/* Home Page */}
            <Route path="/" element={<Home />} />

            {/* Contact Page */}
            <Route path="/contact" element={<Contact />} />

            {/* About Page */}
            <Route path="/about" element={<About />} />

            {/* Hot Deals Page */}
            <Route path="/hotdeals" element={<HotdealsPage />} />

            {/* Products Page (Category-based) */}
            <Route path="/badminton/:category" element={<ProductsPage />} />

            {/* SEO-friendly product route */}
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            
            {/* Legacy route for backward compatibility - redirects to slug-based route */}
            <Route path="/product/:id" element={<ProductDetailPage />} />
            
            {/* Admin Panel Route */}
            <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        </>
    );
}

export default App;