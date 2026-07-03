import styled from "styled-components";
import Modal from "./Modal";
import { useSelectedRestaurant, useCloseModal } from "../store/useModalStore";

const Title = styled.h2`
  margin-bottom: 36px;

  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
`;

const Info = styled.div`
  margin-bottom: 24px;
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

const ButtonContainer = styled.div`
  display: flex;
`;

const Button = styled.button`
  width: 100%;
  height: 44px;

  margin-right: 16px;

  border: none;
  border-radius: 8px;

  font-weight: 600;
  cursor: pointer;

  font-size: 14px;
  line-height: 20px;
`;

const PrimaryButton = styled(Button)`
  background: var(--primary-color);

  color: var(--grey-100);
`;

export default function RestaurantDetailModal() {
  const selectedRestaurant = useSelectedRestaurant();
  const closeModal = useCloseModal();

  return (
    <Modal onClose={closeModal}>
      <Title>{selectedRestaurant.name}</Title>
      <Info>
        <Description>{selectedRestaurant.description}</Description>
      </Info>
      <ButtonContainer>
        <PrimaryButton onClick={closeModal}>닫기</PrimaryButton>
      </ButtonContainer>
    </Modal>
  );
}
