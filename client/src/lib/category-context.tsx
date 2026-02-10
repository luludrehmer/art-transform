import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export type Category = "pets" | "family" | "kids" | "couples" | "self-portrait";

const CATEGORY_SEGMENTS: Category[] = ["pets", "family", "kids", "couples", "self-portrait"];

/** Derive category from path: /pets, /pets/oil-painting, /family/watercolor, etc. */
function categoryFromPath(path: string): Category {
  const segment = path.replace(/^\/+/, "").split("/")[0] || "";
  if (segment === "" || segment === "pets") return "pets";
  if (CATEGORY_SEGMENTS.includes(segment as Category)) return segment as Category;
  return "pets";
}

interface CategoryContextType {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [activeCategory, setActiveCategoryState] = useState<Category>(() => {
    return categoryFromPath(location);
  });

  useEffect(() => {
    const categoryFromRoute = categoryFromPath(location);
    setActiveCategoryState(categoryFromRoute);
  }, [location]);

  const setActiveCategory = (category: Category) => {
    setActiveCategoryState(category);
    const route = category === "pets" ? "/" : `/${category}`;
    setLocation(route);
  };

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}
