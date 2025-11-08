/**
 * Utility functions for dynamically updating meta tags for SEO and social sharing
 */

export const updateMetaTags = (config: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) => {
  const defaultTitle = "Solana Internet Market";
  const defaultDescription = "Create and sell AI agents, digital products, and on-chain services. Powered by x402";
  const defaultImage = "https://simproject.org/sim-logo.png?v=2";
  const defaultUrl = "https://simproject.org";

  const title = config.title || defaultTitle;
  const description = config.description || defaultDescription;
  const image = config.image || defaultImage;
  const url = config.url || defaultUrl;

  // Update document title
  document.title = title;

  // Update or create meta tags
  const updateMetaTag = (property: string, content: string, isName = false) => {
    const attribute = isName ? 'name' : 'property';
    let tag = document.querySelector(`meta[${attribute}="${property}"]`);
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, property);
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  };

  // Standard meta
  updateMetaTag('description', description, true);

  // Open Graph
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image);
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', 'website');

  // Twitter
  updateMetaTag('twitter:card', 'summary_large_image', true);
  updateMetaTag('twitter:title', title, true);
  updateMetaTag('twitter:description', description, true);
  updateMetaTag('twitter:image', image, true);
  updateMetaTag('twitter:url', url, true);
};

export const resetMetaTags = () => {
  updateMetaTags({});
};
