import { hotels, regions, guides } from '../../data/site';

export type SearchItem = {
  name: string;
  city: string;
  area: string;
  summary: string;
  url: string;
  kind: string;
};

export const hotelItems: SearchItem[] = hotels.map(
  ({ name, city, area, summary, slug }) => ({
    name,
    city,
    area,
    summary,
    url: `/hotels/${slug}/`,
    kind: '호텔',
  }),
);

export const regionItems: SearchItem[] = regions.map(
  ({ name, subtitle, intro, slug }) => ({
    name,
    city: name,
    area: subtitle,
    summary: intro,
    url: `/regions/${slug}/`,
    kind: '지역',
  }),
);

export const guideItems: SearchItem[] = guides.map(
  ({ title, category, excerpt, slug }) => ({
    name: title,
    city: category,
    area: '여행 가이드',
    summary: excerpt,
    url: `/guides/${slug}/`,
    kind: '가이드',
  }),
);

export const all: SearchItem[] = [...hotelItems, ...regionItems, ...guideItems];

export const render = (query: string, results: HTMLElement | null) => {
  if (!results) return;
  const q = query.trim().toLocaleLowerCase('ko');
  if (!q) {
    results.innerHTML =
      '<p text="sm slate-500">검색어를 입력하면 관련 결과가 표시됩니다.</p>';
    return;
  }
  const found = all.filter((x) =>
    `${x.name} ${x.city} ${x.area} ${x.summary} ${x.kind}`
      .toLocaleLowerCase('ko')
      .includes(q),
  );
  results.innerHTML = found.length
    ? found
        .map(
          (x) => /* html */ `<a
            href="${x.url}"
            block
            rounded="2xl"
            border="line hover:brand-300 dark:slate-800"
            bg="white dark:slate-900"
            shadow="hover:card"
            p="5"
            transition
            ><span text="xs brand-600" font="bold">${x.kind} · ${x.city}</span>
            <h2 mt="2" text="lg" font="bold">${x.name}</h2>
            <p mt="2" text="sm slate-500" leading="6">${x.summary}</p>
            <span mt="3" inline="block" text="sm brand-600" font="semibold"
              >내용 보기 →</span
            ></a
          >`,
        )
        .join('')
    : /* html */ '<p rounded="2xl" border="line dark:slate-800" bg="white dark:slate-900" p="6" text="sm slate-500" >일치하는 결과가 없습니다. 다른 키워드로 검색해 보세요.</p>';
};

export const setupSearch = (
  form: Element | null,
  input: Element | null,
  results: Element | null,
) => {
  if (!(form instanceof HTMLFormElement)) return;
  if (!(input instanceof HTMLInputElement)) return;
  if (!(results instanceof HTMLElement)) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = input.value ?? '';
    render(q, results);
    history.replaceState(null, '', `?q=${encodeURIComponent(q)}`);
  });

  const initial = new URLSearchParams(location.search).get('q') ?? '';
  if (initial) {
    input.value = initial;
    render(initial, results);
  }
};
