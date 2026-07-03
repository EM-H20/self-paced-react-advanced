import "./App.css";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import RestaurantList from "./components/RestaurantList";
import ModalRenderer from "./components/ModalRenderer";

function App() {
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
