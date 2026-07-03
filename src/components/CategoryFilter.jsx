import styled from "styled-components";
import { ALL_CATEGORIES } from "../constants/categories";
import { useCategory, useSetCategory } from "../store/useRestaurantStore";

const Container = styled.section`
  display: flex;
  justify-content: space-between;

  padding: 0 16px;
  margin-top: 24px;

  select {
    height: 44px;
    min-width: 125px;

    border: 1px solid #d0d5dd;
    border-radius: 8px;
    background: transparent;

    font-size: 16px;
  }
`;

const Filter = styled.select`
  padding: 8px;
`;

export default function CategoryFilter() {
  const category = useCategory();
  const setCategory = useSetCategory();

  return (
    <Container>
      <Filter
        name="category"
        id="category-filter"
        aria-label="음식점 카테고리 필터"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {ALL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Filter>
    </Container>
  );
}
