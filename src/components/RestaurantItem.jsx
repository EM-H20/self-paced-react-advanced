import styled from "styled-components";
import categoryAsian from "../assets/category-asian.png";
import categoryChinese from "../assets/category-chinese.png";
import categoryEtc from "../assets/category-etc.png";
import categoryJapanese from "../assets/category-japanese.png";
import categoryKorean from "../assets/category-korean.png";
import categoryWestern from "../assets/category-western.png";

import { useOpenDetailModal } from "../store/useModalStore";

const categoryImages = {
  한식: categoryKorean,
  중식: categoryChinese,
  일식: categoryJapanese,
  양식: categoryWestern,
  아시안: categoryAsian,
  기타: categoryEtc,
};

const Restaurant = styled.li`
  display: flex;
  align-items: flex-start;

  padding: 16px 8px;

  border-bottom: 1px solid #e9eaed;

  cursor: pointer;
`;

const Category = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 64px;
  height: 64px;

  margin-right: 16px;

  border-radius: 50%;
  background: var(--lighten-color);
`;

const CategoryIcon = styled.img`
  width: 36px;
  height: 36px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Name = styled.h3`
  margin: 0;

  font-size: 18px;
  line-height: 28px;
  font-weight: 600;
`;

const Description = styled.p`
  display: -webkit-box;

  padding-top: 8px;

  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
`;

export default function RestaurantItem({ restaurant }) {
  const openDetailModal = useOpenDetailModal();

  function handleClick() {
    openDetailModal(restaurant);
  }
  return (
    <Restaurant onClick={handleClick}>
      <Category>
        <CategoryIcon
          src={categoryImages[restaurant.category]}
          alt={restaurant.category}
        />
      </Category>
      <Info>
        <Name>{restaurant.name}</Name>
        <Description>{restaurant.description}</Description>
      </Info>
    </Restaurant>
  );
}
