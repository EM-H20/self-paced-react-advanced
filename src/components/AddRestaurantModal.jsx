import styled from "styled-components";
import Modal from "./Modal";
import { ALL_CATEGORIES } from "../constants/categories";
import { useCloseModal } from "../store/useModalStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../constants/api.js";

const Title = styled.h2`
  margin-bottom: 36px;

  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
`;

const HelpText = styled.span`
  color: var(--grey-300);

  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;

  margin-bottom: 36px;

  label {
    color: var(--grey-400);

    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
  }

  input,
  textarea,
  select {
    padding: 8px;
    margin: 6px 0;

    border: 1px solid var(--grey-200);
    border-radius: 8px;

    font-size: 16px;
  }

  textarea {
    resize: none;
  }

  select {
    height: 44px;

    padding: 8px;

    border: 1px solid var(--grey-200);
    border-radius: 8px;

    color: var(--grey-300);
  }

  input[name="name"],
  input[name="link"] {
    height: 44px;
  }
`;

const RequiredFormItem = styled(FormItem)`
  label::after {
    padding-left: 4px;

    color: var(--primary-color);
    content: "*";
  }
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

  &:last-child {
    margin-right: 0;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--primary-color);

  color: var(--grey-100);
`;

const createRestaurant = async (restaurant) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(restaurant),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export default function AddRestaurantModal() {
  const queryClient = useQueryClient();
  const closeModal = useCloseModal();
  const mutation = useMutation({
    mutationFn: createRestaurant,
    onSuccess() {
      closeModal();
      //직접 목록을 다시 가져와 store에 넣는 대신 기존 캐시를 stale 상태로 만들고 활성화된 음식점 Query가 최신 목록을 다시 조회하게 함.
      //Promise를 반환해서 목록 재조회가 끝날 때까지 mutation을 pending 상태로 유지함.
      return queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError() {
      // 실패하면 모달을 닫지 않고 유지
      alert("음식점 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      id: crypto.randomUUID(),
      category: formData.get("category"),
      name: formData.get("name"),
      description: formData.get("description"),
    });
  }

  return (
    <Modal onClose={closeModal}>
      <Title>새로운 음식점</Title>
      <form onSubmit={handleSubmit}>
        <RequiredFormItem>
          <label htmlFor="category">카테고리</label>
          <select name="category" id="category" required>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </RequiredFormItem>

        <RequiredFormItem>
          <label htmlFor="name">이름</label>
          <input type="text" name="name" id="name" required />
        </RequiredFormItem>

        <FormItem>
          <label htmlFor="description">설명</label>
          <textarea
            name="description"
            id="description"
            cols="30"
            rows="5"
          ></textarea>
          <HelpText>메뉴 등 추가 정보를 입력해 주세요.</HelpText>
        </FormItem>

        <ButtonContainer>
          <PrimaryButton type="submit" disabled={mutation.isPending}>
            추가하기
          </PrimaryButton>
        </ButtonContainer>
      </form>
    </Modal>
  );
}
