import { create } from "zustand";
import { persist } from "zustand/middleware";

const BASE_URL = "http://localhost:3000/restaurants";

const useRestaurantStore = create(
  persist(
    (set, get) => ({
      category: "전체",
      restaurants: [],

      actions: {
        setCategory: (category) => {
          set({ category });
        },

        fetchRestaurants: async () => {
          try {
            const response = await fetch(BASE_URL);
            const data = await response.json();
            if (!response.ok) throw data;
            set({ restaurants: data });
          } catch (error) {
            console.error(
              "음식점 데이터를 불러오는 중 오류가 발생했습니다.",
              error,
            );
            // 문구는 호출하는 쪽 상황에 맞게 결정하도록 에러를 전달
            throw error;
          }
        },

        addRestaurant: async (restaurant) => {
          try {
            const response = await fetch(BASE_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(restaurant),
            });
            const data = await response.json();
            if (!response.ok) throw data;
          } catch (error) {
            console.error("음식점을 추가하는 중 오류가 발생했습니다.", error);
            alert("음식점 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            throw error;
          }

          // 추가는 성공. 목록 갱신만 실패하면 추가 성공 사실을 함께 안내(모달은 닫힘)
          try {
            await get().actions.fetchRestaurants();
          } catch {
            alert(
              "음식점은 추가되었지만 목록을 갱신하지 못했습니다. 잠시 후 새로고침 해 주세요.",
            );
          }
        },
      },
    }),
    {
      name: "restaurant-filter",
      // category만 저장. restaurants는 서버에서 다시 받고, actions는 저장 대상 아님
      partialize: (state) => ({ category: state.category }),
    },
  ),
);

export const useCategory = () => useRestaurantStore((state) => state.category);
export const useRestaurants = () =>
  useRestaurantStore((state) => state.restaurants);

export const useSetCategory = () =>
  useRestaurantStore((state) => state.actions.setCategory);
export const useFetchRestaurants = () =>
  useRestaurantStore((state) => state.actions.fetchRestaurants);
export const useAddRestaurant = () =>
  useRestaurantStore((state) => state.actions.addRestaurant);
