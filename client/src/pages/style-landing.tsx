import { useEffect } from "react";
import { useLocation } from "wouter";
import { StyleLandingTemplate } from "@/components/style-landing-template";
import { getStyleContent } from "@/lib/style-content";
import { styleData } from "@/lib/styles";
import type { ArtStyle } from "@shared/schema";

interface StyleLandingPageProps {
  style: string;
}

export default function StyleLandingPage({ style }: StyleLandingPageProps) {
  const [, setLocation] = useLocation();

  const styleId = style as ArtStyle;
  const content = getStyleContent(styleId);
  const styleInfo = styleData[styleId];

  useEffect(() => {
    if (!content || !styleInfo) {
      setLocation("/");
    }
  }, [content, styleInfo, setLocation]);

  if (!content || !styleInfo) {
    return null;
  }

  return <StyleLandingTemplate content={content} styleInfo={styleInfo} />;
}
