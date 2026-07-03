import "./App.css";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import RestaurantList from "./components/RestaurantList";
import ModalRenderer from "./components/ModalRenderer";
import useGetRestaurants from "./hooks/useGetRestaurants";

function App() {
  const error = useGetRestaurants();

  if (error) return <p>{error}</p>;

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
