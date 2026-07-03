import "./App.css";
import { useEffect } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import RestaurantList from "./components/RestaurantList";
import ModalRenderer from "./components/ModalRenderer";
import { useFetchRestaurants } from "./store/useRestaurantStore";

function App() {
  const fetchRestaurants = useFetchRestaurants();

  useEffect(() => {
    fetchRestaurants().catch(() => {
      alert("음식점 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });
  }, [fetchRestaurants]);

  return (
    <>
      <Header />
      <main>
        <CategoryFilter />
        <RestaurantList />
      </main>
      <aside>
        <ModalRenderer />
      </aside>
    </>
  );
}

export default App;
