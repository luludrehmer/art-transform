import { useEffect } from "react";
import { StyleLandingPage } from "@/components/style-landing-page";
import { styleSEOData } from "@shared/seoMetadata";
import { styleData } from "@/lib/styles";

export default function AcrylicPage() {
  const seoData = styleSEOData.acrylic;
  const styleImage = styleData.acrylic.image;

  useEffect(() => {
    document.title = seoData.title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", seoData.metaDescription);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = seoData.metaDescription;
      document.head.appendChild(meta);
    }
  }, []);

  return <StyleLandingPage seoData={seoData} styleImage={styleImage} />;
}
