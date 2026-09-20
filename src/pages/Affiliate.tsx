interface Props { className?: string; }

export default function Affiliate({}: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <article className="rounded-2xl border border-ct-line bg-ct-surface p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface sm:p-10">
        <p className="m-0 text-sm font-medium text-ct-primary">{title}</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
        <p className="mt-8 text-base font-medium leading-8 text-ct-text-soft dark:text-ct-dark-text-soft sm:text-lg">{p1}</p>
        <p className="mt-5 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">{p2}</p>
        <p className="mt-8 text-sm leading-7 text-ct-muted dark:text-ct-dark-muted">최종 업데이트: 2026년 9월</p>
      </article>
    </section>
  );
}
