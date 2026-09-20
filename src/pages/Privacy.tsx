export default function Privacy() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <article className="rounded-2xl border border-ct-line bg-ct-surface p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface sm:p-10">
        <p className="m-0 text-sm font-medium text-ct-primary">Privacy</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">개인정보처리방침</h1>
        <p className="mt-8 text-base font-medium leading-8 text-ct-text-soft dark:text-ct-dark-text-soft sm:text-lg">CozyTrip는 여행 및 호텔 정보를 제공하는 웹사이트입니다. 사이트 이용 과정에서 실제로 어떤 정보가 수집·처리되는지에 맞춰 개인정보 관련 안내를 제공하며, 구현되지 않은 기능이나 수집 항목을 수집한다고 표시하지 않습니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">현재 사이트의 이용 형태</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">CozyTrip에는 일반적인 회원가입이나 로그인 기능이 없으며, 호텔 정보를 확인하고 외부 예약 서비스로 이동하는 방식으로 이용할 수 있습니다. 호텔 예약 자체는 연결된 외부 예약 서비스에서 진행되며, CozyTrip가 그 예약 정보를 직접 처리하는 서비스는 아닙니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">외부 서비스</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">예약 링크를 통해 외부 서비스로 이동하는 경우 해당 서비스의 웹사이트 및 개인정보처리방침이 적용될 수 있습니다. CozyTrip의 페이지에서 외부 서비스로 전달되는 정보와 해당 서비스가 처리하는 정보는 각 서비스의 실제 구현과 정책에 따라 달라질 수 있습니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">광고 및 분석 서비스</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">광고 또는 방문 분석 서비스를 실제로 활성화하는 경우 해당 서비스가 쿠키, 광고 식별자 또는 방문 관련 정보를 처리할 수 있습니다. CozyTrip는 활성화된 외부 서비스의 정책과 설정을 기준으로 관련 안내를 최신 상태로 유지해야 하며, 서비스가 추가되면 이 방침도 함께 갱신합니다.</p>

        <h2 className="mt-10 text-xl font-bold sm:text-2xl">문의 및 변경</h2>
        <p className="mt-4 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">개인정보 관련 안내가 실제 사이트의 데이터 처리 방식과 달라지는 경우 내용을 수정합니다. 개인정보와 관련해 확인이 필요한 사항은 사이트의 문의 안내를 통해 확인할 수 있습니다.</p>

        <p className="mt-10 text-sm leading-7 text-ct-muted dark:text-ct-dark-muted">최종 업데이트: 2026년 9월</p>
      </article>
    </section>
  );
}
