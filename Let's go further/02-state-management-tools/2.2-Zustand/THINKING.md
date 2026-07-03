# 02-2. 전역상태관리 - Zustand

## 🎯 요구사항

- Context API로 구성한 애플리케이션을 Zustand 기반 전역 상태로 마이그레이션하세요.
- props에 대한 요구사항은 2-1 요구사항과 같습니다.
- Zustand를 **왜** 사용하는지, Context API와 비교했을때 어떤 점이 달랐는지, 또 trade-off가 있는지 적어주세요.
  - 기술적인 것도 좋고 개발자의 경험 측면에서도 좋습니다.
- (선택): 카테고리 필터의 선택된 카테고리가 새로고침 후에도 유지되도록 구현해보세요

# WHAT?

## 2-1에서 만든 Context 두 개를 Zustand store 두 개로 그대로 옮기는 작업

뭘 바꿀까. props drilling 을 풀 대상은 2-1 과 똑같음. props 요구사항이 동일하니 [전역으로 빼는 것] 자체는 그대로 두고, **담는 그릇만 Context → store 로 교체**하는 마이그레이션임.

**create로 store를 선언(생성)하고, 컴포넌트에서 useStore(selector)로 필요한 조각만 꺼내 쓰면 됨**

### Context 와 가장 다른 점은 Provider 로 트리를 감싸지 않는다는 것. store 가 React 트리 밖(모듈 스코프)에 살아있어서, import 해서 바로 구독함.

### store 예시

```js
const useStore = create(() => ({
  매개변수: 값,
}));
```

# WHERE?

## RestaurantContext -> useRestaurantStore

기존 `RestaurantContext.Provider` 의 value: `category`, `setCategory`, `restaurants`, `addRestaurant`, `filteredRestaurants`. 이걸 `useRestaurantStore` 하나로 옮김.

소비처 (어느 파일이 무슨 값을 쓰나)

- `Header.jsx` → category
- `CategoryFilter.jsx` → category, setCategory
- `RestaurantList.jsx` → filteredRestaurants
- `AddRestaurantModal.jsx` → addRestaurant

## ModalContext -> useModalStore

기존 `ModalContext.Provider` 의 value: `activeModal`, `selectedRestaurant`, `openDetailModal`, `openAddModal`, `closeModal`. 이걸 `useModalStore` 하나로 옮김.

소비처 (어느 파일이 무슨 값을 쓰나)

- `Header.jsx` → openAddModal
- `RestaurantItem.jsx` → openDetailModal
- `ModalRenderer.jsx` → activeModal
- `RestaurantDetailModal.jsx` → selectedRestaurant, closeModal
- `AddRestaurantModal.jsx` → closeModal

## main.jsx

`<RestaurantProvider><ModalProvider><App /></ModalProvider></RestaurantProvider>` 중첩 래핑이 사라짐. store 는 Provider 없이도 동작하므로 main.jsx 는 `<App />` 만 남음. Context.js / Provider.jsx 파일도 같이 제거 대상.

# WHY?

Context 대신 Zustand 를 쓰는 핵심 이유는 두 개. **불필요한 리렌더 막기** 랑 **보일러플레이트 줄이기**.

## 1. 선택적 구독 (가장 큰 이유)

Context 는 value 가 바뀌면 그 Context 구독하는 컴포넌트가 다 리렌더됨. 객체 하나에 상태 여러 개 담아두면, 그중 하나만 바뀌어도 전부 다시 그려짐. 지금 RestaurantContext 도 category / restaurants / filteredRestaurants 가 한 value 에 묶여 있어서, restaurants 만 채워져도 category 만 쓰는 Header 까지 리렌더됨.

Zustand 는 selector 로 필요한 조각만 구독함.

```js
// count 바뀔 때만 리렌더됨
const count = useStore((state) => state.count);
```

user 만 구독한 컴포넌트는 count 가 바뀌어도 영향 안 받음. Context 로 똑같이 하려면 Context 를 잘게 쪼개야 함.

## 2. Provider 불필요

Context 는 트리 위를 `<Provider>` 로 감싸야 하고, Context 여러 개 겹치면 Provider 지옥 됨(지금 main.jsx 가 딱 그 중첩 상태). Zustand 는 store 가 컴포넌트 트리 밖에 있어서 Provider 로 감쌀 필요가 없음.

## 3. 보일러플레이트가 적음

Context + useReducer 로 짜면 Context 생성, Provider, dispatch, action 타입까지 코드가 많음. Zustand 는 create 하나로 상태랑 업데이트 함수까지 정의함.

```js
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 4. 컴포넌트 밖에서 접근 가능

useStore.getState() 로 React 밖(이벤트 핸들러, 일반 함수)에서도 상태를 읽고 쓸 수 있음.

## 정리

Context 는 사실 의존성 주입(DI) 도구지 상태 관리 도구가 아님. 테마, 인증 정보처럼 자주 안 바뀌는 값엔 Context 가 맞고, 자주 바뀌는 상태엔 리렌더 최적화가 내장된 Zustand 가 더 맞음.

## trade-off

- React 빌트인이 아니라 외부 라이브러리 의존이 하나 늘어남. (Context 는 무설치)
- store 가 모듈 스코프 싱글톤이라, selector 를 안 쓰고 통째로 꺼내 쓰면 Context 와 똑같이 다 리렌더됨. 이득을 보려면 selector 를 의식적으로 써야 함.
- 이 정도 규모면 Context 로도 충분한데 라이브러리를 더하는 게 과할 수 있음. (여기선 학습 목적)

# HOW?

### src/stores/\* 에 store 두 개. 기존 contexts 폴더(Context.js + Provider.jsx)는 제거.

## useRestaurantStore

restaurants, category 상태와 setCategory, fetchRestaurants, addRestaurant action 을 담음.
-> useRestaurants 훅의 fetch 로직을 store action 으로 흡수 (훅 파일은 삭제).
-> 초기 fetch 는 store 가 useEffect 를 못 쓰니 App 에서 트리거, filteredRestaurants 는 컴포넌트에서 계산.

## useModalStore

activeModal, selectedRestaurant 상태와 openDetailModal, openAddModal, closeModal action 을 담음.
-> ModalProvider 의 useState 로직을 set 호출로 그대로 옮김.

# 추가로 알게 된 것

set, get은 Zustand의 create()가 전달해 주는 스토어 관리 함수

- set: 스토어 상태를 변경합니다.
  - set({ category }) → category만 변경
  - set({ restaurants: data }) → 음식점 목록 변경
  - 기존 상태와 얕게 병합되므로 다른 상태는 유지

- get: 현재 스토어 전체를 가져옵니다. 상태뿐 아니라 액션 함수도 포함
  - get().fetchRestaurants() → 현재 스토어의 fetchRestaurants 실행

즉, 아래 코드는 음식점 추가 후 목록을 다시 조회

await get().fetchRestaurants();

# 참고

- [Zustand 공식 문서](https://zustand.docs.pmnd.rs/)
- [Context - React 문서](https://react.dev/reference/react/useContext)
- [코딩애플 - Zustand 영상](https://www.youtube.com/watch?v=zNHZJ_iEMPA)
