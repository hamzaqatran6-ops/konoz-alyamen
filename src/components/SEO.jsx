import { useEffect } from "react";

/**
 * Simple SEO utility component
 */
const SEO = ({ title, description }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | كنوز اليمن`;
    }
    
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
};

export default SEO;
