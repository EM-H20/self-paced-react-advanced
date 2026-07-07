import styled from "styled-components";
import RestaurantItem from "./RestaurantItem";
import { useCategory } from "../store/useRestaurantStore";
import useGetRestaurants from "../hooks/useGetRestaurants";

const Container = styled.section`
  display: flex;
  flex-direction: column;

  padding: 0 16px;
  margin: 16px 0;
`;

export default function RestaurantList() {
  const { data, isPending, isError } = useGetRestaurants();
  const category = useCategory();

  if (isPending) return <p>음식점 목록을 불러오는 중입니다...</p>;
  if (isError) return <p>음식점 목록을 불러오지 못했습니다.</p>;

  const filteredRestaurants =
    category === "전체"
      ? data
      : data.filter((restaurant) => restaurant.category === category);

  return (
    <Container>
      <ul className="restaurant-list">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantItem key={restaurant.id} restaurant={restaurant} />
        ))}
      </ul>
    </Container>
  );
}
