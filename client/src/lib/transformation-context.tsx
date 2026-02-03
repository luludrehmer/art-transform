import { createContext, useContext, useState, type ReactNode } from "react";
import type { ArtStyle } from "@shared/schema";

interface TransformationData {
  originalImage: string;
  transformedImage: string;
  style: ArtStyle;
  styleName: string;
}

interface TransformationContextType {
  transformationData: TransformationData | null;
  setTransformationData: (data: TransformationData | null) => void;
  pendingStyle: ArtStyle | null;
  setPendingStyle: (style: ArtStyle | null) => void;
}

const TransformationContext = createContext<TransformationContextType | undefined>(undefined);

export function TransformationProvider({ children }: { children: ReactNode }) {
  const [transformationData, setTransformationData] = useState<TransformationData | null>(null);
  const [pendingStyle, setPendingStyle] = useState<ArtStyle | null>(null);

  return (
    <TransformationContext.Provider value={{ transformationData, setTransformationData, pendingStyle, setPendingStyle }}>
      {children}
    </TransformationContext.Provider>
  );
}

export function useTransformation() {
  const context = useContext(TransformationContext);
  if (context === undefined) {
    throw new Error("useTransformation must be used within a TransformationProvider");
  }
  return context;
}
