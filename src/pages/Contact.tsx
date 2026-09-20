export default function Contact() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <article className="rounded-2xl border border-ct-line bg-ct-surface p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface sm:p-10">
        <p className="m-0 text-sm font-medium text-ct-primary">Contact</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">문의</h1>
        <p className="mt-8 text-base font-medium leading-8 text-ct-text-soft dark:text-ct-dark-text-soft sm:text-lg">CozyTrip의 호텔 정보, 데이터 오류, 이미지 출처, 제휴 관련 사항에 대한 문의를 위한 페이지입니다. 현재 사이트에는 별도의 공개 이메일 주소나 문의 폼을 연결하지 않았으므로, 확인되지 않은 연락처를 임의로 안내하지 않습니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">정보 오류를 발견했다면</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">호텔명, 지역, 이미지 또는 기타 정보에 오류가 있다고 판단되는 경우 사이트에 표시된 출처와 함께 알려주시면 확인 후 수정 여부를 검토할 수 있습니다. 예약 조건이나 실시간 가격은 변경될 수 있으므로 해당 정보는 예약 서비스의 최신 페이지를 기준으로 확인해 주세요.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">이미지 및 콘텐츠 관련 문의</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">이미지 사용 권한이나 콘텐츠와 관련해 확인이 필요한 경우 해당 페이지의 호텔명과 이미지 위치를 함께 특정해 주는 것이 좋습니다. 사이트에 연결된 외부 데이터의 권리 및 이용 조건은 각 데이터 제공처의 정책에 따라 달라질 수 있습니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">제휴 관련 문의</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">CozyTrip는 호텔 예약 서비스와 제휴 링크를 사용할 수 있습니다. 제휴 관계나 광고 표시와 관련된 문의가 있는 경우 구체적인 페이지와 내용을 함께 확인할 수 있도록 전달해 주세요.</p>

        <p className="mt-10 text-sm leading-7 text-ct-muted dark:text-ct-dark-muted">최종 업데이트: 2026년 9월</p>
      </article>
    </section>
  );
}
