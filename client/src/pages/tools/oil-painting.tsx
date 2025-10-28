import { useEffect } from "react";
import { StyleLandingPage } from "@/components/style-landing-page";
import { styleSEOData } from "@shared/seoMetadata";
import { styleData } from "@/lib/styles";

export default function OilPaintingPage() {
  const seoData = styleSEOData["oil-painting"];
  const styleImage = styleData["oil-painting"].image;

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
