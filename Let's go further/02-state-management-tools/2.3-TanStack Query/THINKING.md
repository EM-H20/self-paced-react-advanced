# 02-3. 서버상태관리 - TanStack Query

💡해당 미션은 **여러 사용자가 하나의 서버를 공유하고, 식당 목록이 주기적으로 업데이트되는 환경**을 가정하여 진행합니다.

## 🎯 요구사항

- TanStack Query를 사용해 서버 상태를 클라이언트 상태와 분리하고, 효율적인 데이터 캐싱과 요청 관리를 구현해 보세요.
  - 쿼리 및 뮤테이션 설정은 명확한 이유가 있다면 자유롭게 변경해도 좋습니다.
- TanStack Query를 **왜** 사용하는지, 서버 상태와 클라이언트 상태를 분리하였을때 어떤 점이 달랐는지, 또 trade-off가 있는지 적어주세요.
  - 기술적인 것도 좋고 개발자의 경험 측면에서도 좋습니다.
- TanStack Query Devtools를 이용하여 Query의 변화와 Mutation의 발생을 확인해보세요.
- (선택) 뮤테이션 로직에 낙관적 업데이트(Optimistic Update)를 적용해 보고 어떤 상황에서 낙관적 업데이트가 효과적인지, 그리고 주의해야 할 점은 무엇인지 적어주세요.
  - Browser Throttling 기능을 활용하여 네트워크 속도를 느리게 설정한 뒤 낙관적 업데이트가 실제로 어떻게 동작하는지 확인해 보세요.

## ✅ 키워드

- props drilling: drilling 은 단순히 한 단계 더 내려가는 게 아니라, **중간 컴포넌트가 그 prop 을 사용하지 않고 전달만** 할 때 발생한다

- 서버 상태관리: 서버가 원본을 소유하고 여러 사용자가 공유하는 비동기 데이터를 조회, 캐싱, 동기화, 갱신하는 것
  - TanStack Query: 서버 상태의 조회, 캐싱, 동기화, 변경을 관리하는 라이브러리
    - 강력한 비동기 혹은 서버 상태 도구
  - QueryClient: Query cache와 Mutation(서버 데이터를 생성, 수정, 삭제하는 비동기 작업)을 관리하고 조회 무효화 같은 작업을 제공하는 객체
    - Mutation : POST, PATCH, DELETE 요청 등 서버에 사이드 이펙트를 일으키는 경우 사용
  - Query Key: Query cache를 구분하고 같은 서버 데이터를 식별하는 배열 형태의 고유 키
  - useQuery: 서버 데이터를 조회하고 캐시된 데이터와 요청 상태를 구독하는 Hook
  - useMutation: 서버 데이터를 생성, 수정, 삭제하는 비동기 작업을 실행하고 상태를 제공하는 Hook
  - Optimistic Update: 서버 응답을 기다리지 않고 성공을 예상해 UI를 먼저 변경하고, 실패하면 이전 상태로 되돌리는 방식

# WHAT?

## Zustand에 같이 들어있는 서버 상태와 클라이언트 상태를 분리하는 작업

현재 `useRestaurantStore`에는 성격이 다른 상태가 같이 있음.

- 서버 상태: `restaurants`, `fetchRestaurants`, `addRestaurant`
- 클라이언트 상태: `category`, `setCategory`

`restaurants`는 서버가 원본을 가지고 있고 다른 사용자가 언제든 바꿀 수 있음. 클라이언트가 가진 배열은 서버 데이터의 복사본일 뿐이라서 오래되었는지, 다시 받아야 하는지, 요청 중인지까지 관리해야 함.

**restaurants 조회와 추가는 TanStack Query로 옮기고, category와 모달처럼 브라우저 안에서만 쓰는 상태는 Zustand에 그대로 둠**

TanStack Query가 서버 상태의 캐시를 맡고 Zustand는 클라이언트 상태만 맡게 됨.

# WHERE?

## main.jsx

`QueryClient`를 만들고 `<QueryClientProvider>`로 `<App />`을 감쌈. Query 캐시는 이 client가 관리함.

개발 환경에서는 `<ReactQueryDevtools />`도 추가해서 `restaurants` Query의 fresh / stale / fetching 변화와 Mutation 실행 상태를 확인함.

## App.jsx

현재 `useEffect`에서 `fetchRestaurants`를 직접 호출하는 로직을 제거함.

데이터가 필요한 `RestaurantList`가 `useGetRestaurants`를 사용하면 컴포넌트가 마운트될 때 TanStack Query가 조회 시점과 요청 상태를 관리하므로 App이 먼저 데이터를 받아서 store에 넣을 이유가 없음.

## useGetRestaurants.js

현재 `useState`와 `useEffect`로 관리하는 음식점 조회와 오류 상태를 `useQuery`로 교체함.

- `queryKey: ["restaurants"]`
- `queryFn`: `GET /restaurants`
- `staleTime: 1분`: 받은 데이터를 1분 동안 fresh로 보고 불필요한 재요청을 줄임
- `gcTime: 5분`: 구독하지 않는 inactive cache를 5분 동안 보관함. 기본값과 같지만 캐시 보관 기준을 명시함
- `refetchInterval: 1분`: 다른 사용자가 변경한 목록을 주기적으로 반영

조회 로직과 요청 상태를 커스텀 Hook 안에 묶어서 컴포넌트는 TanStack Query의 설정을 몰라도 `data`, `isPending`, `isError`만 받아서 사용할 수 있게 함.

## RestaurantList.jsx

`useRestaurants` Zustand selector 대신 `useGetRestaurants`로 음식점 목록과 요청 상태를 가져옴.

카테고리 필터는 서버 상태가 아니라 사용자가 현재 화면에서 선택한 값이므로 Zustand의 `category`를 그대로 사용함. Query 결과와 category를 조합해서 화면에서 `filteredRestaurants`를 계산함.

## AddRestaurantModal.jsx

`addRestaurant` Zustand action 대신 `useMutation`으로 `POST /restaurants`를 실행함.

추가 성공 후 `queryClient.invalidateQueries({ queryKey: ["restaurants"] })`를 호출함. 직접 목록을 다시 가져와 store에 넣는 대신 기존 캐시를 stale 상태로 만들고 활성화된 음식점 Query가 최신 목록을 다시 조회하게 함.

## useRestaurantStore.js

`restaurants`, `fetchRestaurants`, `addRestaurant`를 제거하고 `category`, `setCategory`만 남김.

같은 음식점 목록을 Zustand와 Query cache 양쪽에 저장하면 어떤 값이 최신인지 판단해야 하므로 서버 상태의 원본을 두 군데 만들지 않음.

# WHY?

## 1. 서버 상태는 클라이언트가 소유하지 않음

Zustand에 저장한 `restaurants` 배열은 한 번 받아온 스냅샷임. 다른 사용자가 서버 데이터를 바꿔도 현재 앱은 알 수 없고 직접 다시 요청하기 전까지 오래된 목록을 보여줌.

TanStack Query는 데이터를 fresh / stale 상태로 구분하고, 설정한 주기나 창 재포커스 같은 시점에 백그라운드에서 다시 동기화할 수 있음.

## 2. 요청 상태를 따로 만들 필요가 없음

직접 구현하면 `data`, `isLoading`, `error` 상태와 요청 실행 시점을 각각 관리해야 함. TanStack Query의 `useQuery`와 `useMutation`은 요청 상태를 같이 제공하므로 컴포넌트는 현재 상태에 맞는 UI만 결정하면 됨.

## 3. 캐시와 중복 요청 처리가 내장됨

같은 `queryKey`를 사용하는 컴포넌트는 같은 캐시를 구독함. 여러 컴포넌트에서 음식점 목록이 필요해도 각자 별도 서버 상태를 만들지 않고 `["restaurants"]`라는 같은 데이터로 다룰 수 있음.

## 4. 조회와 변경의 역할이 분명해짐

- `useQuery`: 서버에서 데이터를 읽고 캐시함
- `useMutation`: 서버 데이터를 변경함
- `invalidateQueries`: 변경으로 오래된 Query를 다시 동기화함

기존 `addRestaurant` 안에서 POST와 목록 재조회를 순서대로 직접 제어하던 코드보다 각 작업의 목적이 드러남.

## 5. 서버 상태와 클라이언트 상태의 수명이 다름

`restaurants`는 서버와 동기화해야 하고 캐시 만료 기준이 필요함. 반면 `category`와 `activeModal`은 현재 사용자의 UI 선택이라 서버 재조회와 관계없음.

둘을 분리하면 모든 상태를 하나의 전역 store 규칙으로 관리하지 않아도 됨.

## trade-off

- React 빌트인이 아닌 외부 라이브러리와 Devtools 의존성이 추가됨.
- `staleTime`, `gcTime`, 재시도, 창 포커스 재요청 같은 기본 동작을 이해하지 못하면 예상하지 않은 요청이 발생할 수 있음.
- 1분 polling은 최신성을 높이지만 화면을 열어둔 동안 주기적인 네트워크 요청이 생김. 서버 변경 빈도와 비용에 따라 주기를 조정해야 함.
- Query cache는 서버 상태의 캐시지 모든 전역 상태를 대신하는 store가 아님. category나 modal까지 Query에 넣으면 역할 구분이 다시 흐려짐.
- 이 정도 규모에서는 직접 fetch해도 구현할 수 있지만, 여러 사용자가 데이터를 공유하고 주기적으로 바뀐다는 조건에서는 동기화 규칙을 직접 유지하는 비용이 더 커짐.

# HOW?

## QueryClient 설정

`QueryClient`는 렌더링할 때마다 새로 만들지 않고 main.jsx 모듈 스코프에 한 번 생성함. 이 client를 `<QueryClientProvider>`에 넘겨 `<App />`을 감싸고, 같은 위치에 `<ReactQueryDevtools>`를 추가함.

## 음식점 조회 - 해당 시간은 유튜브 링크 예시를 참고함

`queryFn`은 스토어를 거치지 않는 순수 fetch 함수로 작성함. 응답을 JSON으로 파싱해 return하면 그 값이 Query cache에 저장됨. 요청 URL은 constants/api.js의 `BASE_URL` 상수로 분리해 조회와 추가에서 같이 사용함.

`RestaurantList`는 `useGetRestaurants`가 반환한 `data`, `isPending`, `isError`를 사용해 데이터와 요청 상태만 화면에 렌더링함. `isPending`, `isError`를 먼저 분기하고 나면 그 아래에서는 `data`가 항상 존재함.

`queryFn`은 응답이 실패했을 때 반드시 throw 해야 Query가 error 상태로 전환됨. `fetch`는 4xx, 5xx 응답만으로 reject되지 않으므로 `response.ok` 확인은 유지함.

## 음식점 추가

POST 요청만 담당하는 `createRestaurant` 함수를 만들어 `useMutation`의 `mutationFn`으로 등록함. 모달은 `mutateAsync`로 실행해서 성공하면 모달을 닫고, 실패하면 모달을 유지한 채 alert로 안내함.

`onSuccess`에서 `invalidateQueries`가 끝나는 Promise를 반환해서 목록 재조회가 끝날 때까지 Mutation을 pending 상태로 유지함. 제출 버튼 비활성화에 `isPending`을 사용하면 중복 등록도 막을 수 있음.

## 낙관적 업데이트

음식점 추가는 서버 응답 전에도 새 항목을 목록에 먼저 보여줄 수 있어서 느린 네트워크에서 체감 속도가 좋아짐.

다만 서버가 id나 값을 최종 결정하거나 등록 실패 가능성이 높다면 화면에 성공처럼 먼저 보여주는 것이 오히려 혼란을 줄 수 있음. 적용한다면 아래 순서가 필요함.

1. 진행 중인 `["restaurants"]` 조회 취소
2. 이전 캐시 저장
3. 새 음식점을 캐시에 임시 추가
4. 실패하면 이전 캐시로 rollback
5. 성공/실패와 관계없이 마지막에 invalidate해서 서버 값과 다시 동기화

이번 미션의 기본 구현은 성공 후 invalidate하는 방식으로 먼저 동작을 확인하고, Browser Throttling에서 지연이 실제 UX 문제로 보일 때 낙관적 업데이트를 적용함.

# 추가로 알게 된 것

## Query Key

Query Key는 단순한 이름이 아니라 캐시를 구분하는 식별자임. 같은 데이터를 읽는 곳에서는 같은 Key를 사용해야 같은 캐시를 공유함.

필터 조건까지 서버 요청에 포함한다면 `["restaurants", { category }]`처럼 조건도 Key에 넣어야 조건별 결과가 서로 다른 캐시로 관리됨.

## staleTime과 gcTime

- `staleTime`: 데이터를 fresh로 보는 시간. 지나면 캐시가 바로 삭제되는 게 아니라 재조회 대상이 될 수 있는 stale 상태가 됨.
- `gcTime`: 아무 컴포넌트도 구독하지 않는 inactive 캐시를 메모리에 보관하는 시간.

둘은 역할이 다르므로 캐시가 오래 남는 것과 화면에 오래된 데이터를 보여주는 문제를 같은 설정으로 해결하면 안 됨.

## invalidateQueries

`invalidateQueries`는 서버 데이터를 직접 바꾸지 않음. 해당 Query를 stale 상태로 표시하고 활성 Query를 백그라운드에서 다시 조회해서 서버와 맞춤.

# 참고

- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query 메인테이너 Tk Dodo 님의 블로그](https://tkdodo.eu/blog/tags/react-query)
- [테코톡(시모의 Tanstack Query)](https://www.youtube.com/watch?v=RfK15tw8H-I)
