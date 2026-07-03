import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../constants/api.js";

const fetchRestaurants = async () => {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export default function useGetRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,

    //여러 사용자가 하나의 서버를 공유하고, 식당 목록이 주기적으로 업데이트되는 환경. 멀티 유저 가정 때문에 추가
    refetchInterval: 1 * 60 * 1000,
  });
}
