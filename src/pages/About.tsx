export default function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <article className="rounded-2xl border border-ct-line bg-ct-surface p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface sm:p-10">
        <p className="m-0 text-sm font-medium text-ct-primary">CozyTrip 코지트립</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">코지트립 소개</h1>
        <p className="mt-8 text-base font-medium leading-8 text-ct-text-soft dark:text-ct-dark-text-soft sm:text-lg">CozyTrip는 일본 여행을 준비할 때 호텔과 지역 정보를 한곳에서 확인할 수 있도록 정리하는 여행 정보 사이트입니다. 현재는 도쿄, 오사카, 후쿠오카, 삿포로를 중심으로 호텔 정보와 여행 준비에 참고할 내용을 제공합니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">어떤 정보를 제공하나요?</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">호텔 페이지에서는 숙소의 기본 정보와 예약 전에 확인할 항목을 중심으로 소개합니다. 객실, 시설, 위치, 체크인 조건처럼 데이터로 확인할 수 있는 내용과 확인이 필요한 내용을 구분해 안내하는 것을 기본 원칙으로 합니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">호텔 정보의 출처</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">현재 호텔 데이터는 제휴 데이터 제공처인 마이리얼트립에서 제공되는 정보를 기반으로 구성합니다. 데이터가 제공하지 않는 객실 세부사항이나 이용 조건은 임의로 만들어 설명하지 않으며, 예약 시점의 최신 정보는 연결된 예약 페이지에서 다시 확인하도록 안내합니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">정보를 이용할 때 확인할 점</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">호텔 요금, 객실 재고, 취소 조건, 운영시간 등은 날짜와 예약 상품에 따라 달라질 수 있습니다. 따라서 CozyTrip의 콘텐츠는 여행 계획을 세우기 위한 참고 정보로 이용하고, 실제 예약 전에는 예약 페이지에 표시되는 최신 조건을 확인해 주세요.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">운영 원칙</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">CozyTrip는 확인 가능한 정보를 구분해서 전달하고, 광고나 제휴 관계가 있는 경우 이를 명확하게 안내하는 것을 목표로 합니다. 정보가 부족한 경우에는 부족한 부분을 숨기기보다 확인되지 않았다는 점을 표시합니다.</p>

        <p className="mt-10 text-sm leading-7 text-ct-muted dark:text-ct-dark-muted">최종 업데이트: 2026년 9월</p>
      </article>
    </section>
  );
}
