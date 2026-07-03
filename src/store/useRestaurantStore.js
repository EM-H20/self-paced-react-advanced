import { create } from "zustand";
import { persist } from "zustand/middleware";

const useRestaurantStore = create(
  persist(
    (set) => ({
      category: "전체",

      actions: {
        setCategory: (category) => {
          set({ category });
        },
      },
    }),
    {
      name: "restaurant-filter",
      partialize: (state) => ({ category: state.category }),
    },
  ),
);

export const useCategory = () => useRestaurantStore((state) => state.category);
export const useSetCategory = () =>
  useRestaurantStore((state) => state.actions.setCategory);
