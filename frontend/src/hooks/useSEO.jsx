import { useEffect } from 'react';

/**
 * Custom hook for managing SEO meta tags
 * @param {Object} seoData - SEO configuration object
 * @param {string} seoData.title - Page title
 * @param {string} seoData.description - Meta description
 * @param {string} seoData.keywords - Meta keywords (comma-separated)
 * @param {string} seoData.image - Open Graph image URL
 * @param {string} seoData.url - Canonical URL
 * @param {string} seoData.type - Open Graph type (default: 'website')
 * @param {Object} seoData.structuredData - JSON-LD structured data object
 */
const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    const {
      title,
      description,
      keywords,
      image,
      url,
      type = 'website',
      structuredData,
    } = seoData;

    const baseUrl = 'https://www.winners.lk';
    const fullUrl = url ? `${baseUrl}${url}` : window.location.href;
    const fullImage = image 
      ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
      : `${baseUrl}/images/logo-winnerswhitebackground.png`;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags for social sharing
    updateMetaTag('og:title', title || 'Winners Sports - Badminton Equipment', true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:site_name', 'Winners Sports', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || 'Winners Sports');
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data script if any
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Optionally reset to default values on unmount
      // For now, we'll leave the meta tags as they are
    };
  }, [seoData]);
};

export default useSEO;

