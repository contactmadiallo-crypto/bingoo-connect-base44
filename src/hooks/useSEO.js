import { useEffect } from "react";

/**
 * Dynamically sets <head> meta tags for SEO and social sharing.
 * Restores defaults on unmount.
 */
export function useSEO({ title, description, image, url, type = "profile", structuredData } = {}) {
  useEffect(() => {
    const defaultTitle = "Bingoo Connect — NFC Business Cards & Digital Profiles";
    const defaultDesc = "One tap to share your entire business world. NFC-powered digital profiles for professionals.";
    const defaultImage = "https://media.base44.com/images/public/692bd9007b93ba81de543346/5bf500988_BingooconnectNFCBRAND.png";

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = selector.match(/\[([^=]+)="([^"]+)"\]/)?.slice(1) || [];
        if (attrName) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value || "");
    };

    const finalTitle = title || defaultTitle;
    const finalDesc = description || defaultDesc;
    const finalImage = image || defaultImage;
    const finalUrl = url || window.location.href;

    // Title
    document.title = finalTitle;

    // Standard meta
    setMeta('meta[name="description"]', "content", finalDesc);

    // Open Graph
    setMeta('meta[property="og:title"]', "content", finalTitle);
    setMeta('meta[property="og:description"]', "content", finalDesc);
    setMeta('meta[property="og:image"]', "content", finalImage);
    setMeta('meta[property="og:url"]', "content", finalUrl);
    setMeta('meta[property="og:type"]', "content", type === "profile" ? "profile" : "website");
    setMeta('meta[property="og:site_name"]', "content", "Bingoo Connect");

    // Twitter
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", finalTitle);
    setMeta('meta[name="twitter:description"]', "content", finalDesc);
    setMeta('meta[name="twitter:image"]', "content", finalImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", finalUrl);

    // Structured data
    let ldScript = document.getElementById("ld-json-seo");
    if (structuredData) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.type = "application/ld+json";
        ldScript.id = "ld-json-seo";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(structuredData);
    }

    // Cleanup — restore defaults on unmount
    return () => {
      document.title = defaultTitle;
      setMeta('meta[name="description"]', "content", defaultDesc);
      setMeta('meta[property="og:title"]', "content", "Bingoo Connect");
      setMeta('meta[property="og:description"]', "content", defaultDesc);
      setMeta('meta[property="og:image"]', "content", defaultImage);
      setMeta('meta[property="og:url"]', "content", "https://bingooconnect.com");
      setMeta('meta[property="og:type"]', "content", "website");
      setMeta('meta[name="twitter:title"]', "content", "Bingoo Connect");
      setMeta('meta[name="twitter:description"]', "content", defaultDesc);
      setMeta('meta[name="twitter:image"]', "content", defaultImage);
      if (canonical) canonical.setAttribute("href", "https://bingooconnect.com");
      if (ldScript) ldScript.remove();
    };
  }, [title, description, image, url, structuredData]);
}