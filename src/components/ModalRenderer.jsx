import RestaurantDetailModal from "./RestaurantDetailModal";
import AddRestaurantModal from "./AddRestaurantModal";
import { useActiveModal } from "../store/useModalStore";

export default function ModalRenderer() {
  const activeModal = useActiveModal();
  switch (activeModal) {
    case "detail":
      return <RestaurantDetailModal />;
    case "add":
      return <AddRestaurantModal />;
    default:
      return null;
  }
}
