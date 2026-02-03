import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export type Category = "pets" | "family" | "kids";

const categoryRoutes: Record<string, Category> = {
  "/": "pets",
  "/pets": "pets",
  "/family": "family",
  "/kids": "kids",
};

interface CategoryContextType {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [activeCategory, setActiveCategoryState] = useState<Category>(() => {
    return categoryRoutes[location] || "pets";
  });

  useEffect(() => {
    const categoryFromRoute = categoryRoutes[location];
    if (categoryFromRoute && categoryFromRoute !== activeCategory) {
      setActiveCategoryState(categoryFromRoute);
    }
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
