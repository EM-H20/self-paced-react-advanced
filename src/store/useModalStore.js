import { create } from "zustand";

const useModalStore = create((set) => ({
  activeModal: null, // null, "detail", "add"
  selectedRestaurant: null,

  actions: {
    openDetailModal: (restaurant) => {
      set({ selectedRestaurant: restaurant, activeModal: "detail" });
    },

    openAddModal: () => {
      set({ activeModal: "add" });
    },

    closeModal: () => {
      //openDetailModal과 일관성을 위해서 selectedRestaurant도 초기화
      set({ selectedRestaurant: null, activeModal: null });
    },
  },
}));

export const useActiveModal = () => useModalStore((state) => state.activeModal);
export const useSelectedRestaurant = () =>
  useModalStore((state) => state.selectedRestaurant);

export const useOpenDetailModal = () =>
  useModalStore((state) => state.actions.openDetailModal);
export const useOpenAddModal = () =>
  useModalStore((state) => state.actions.openAddModal);
export const useCloseModal = () =>
  useModalStore((state) => state.actions.closeModal);
