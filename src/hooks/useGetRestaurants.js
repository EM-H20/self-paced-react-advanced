import { useEffect, useState } from "react";
import { useFetchRestaurants } from "../store/useRestaurantStore";

export default function useGetRestaurants() {
  const fetchRestaurants = useFetchRestaurants();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants().catch(() => {
      setError("음식점 데이터를 불러오지 못했습니다.");
    });
  }, [fetchRestaurants]);

  return error;
}
