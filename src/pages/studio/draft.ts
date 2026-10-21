export type SourceRow = { label: string; url: string; checkedAt: string };
export type FactRow = {
  label: string;
  value: string;
  sourceUrl: string;
  verified: boolean;
};

export const safe = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', ' ');

export const parseSources = (value: string): SourceRow[] =>
  value
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter(
      (parts) =>
        parts.length >= 2 && parts[0] && /^https?:\/\//i.test(parts[1]),
    )
    .map((parts) => ({
      label: parts[0],
      url: parts[1],
      checkedAt: parts[2] ?? '',
    }));

export const parseFacts = (value: string): FactRow[] =>
  value
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => ({
      label: parts[0],
      value: parts[1],
      sourceUrl: parts[2] ?? '',
      verified: parts[3]?.toLowerCase() === 'true',
    }));

export type DraftData = {
  name: string;
  city: string;
  summary: string;
  officialUrl: string;
  sources: SourceRow[];
  facts: FactRow[];
  imageRights: string;
  affiliateUrl: string;
};

export const generateDraft = (data: DraftData) => {
  const { name, city, summary, officialUrl, sources, facts, imageRights, affiliateUrl } = data;

  const sourceBlock = sources.length
    ? sources
        .map(
          (s) =>
            `- [${s.label}](${s.url})${s.checkedAt ? ` (확인일: ${s.checkedAt})` : ' (확인일 미입력)'}`,
        )
        .join('\n')
    : '- 출처 미입력: 게시 전에 반드시 출처를 추가하세요.';

  const factsBlock = facts.length
    ? facts
        .map(
          (f) =>
            `- **${f.label}:** ${f.value} — ${f.verified ? '검증 완료 표시(근거 재확인 필요)' : '미검증'}${f.sourceUrl ? ` [출처](${f.sourceUrl})` : ''}`,
        )
        .join('\n')
    : '- 확인된 사실이 없습니다.';

  const markdown = `---\nstatus: needs_review\npublish: false\nname: "${safe(name)}"\ncity: "${safe(city)}"\nimageRights: ${imageRights}\n---\n\n# ${name} — 호텔 소개 검토 초안\n\n> **게시 금지: 편집자의 사실 검증과 권리 확인이 필요합니다.** 이 문서는 자동 게시되지 않습니다.\n\n## 소개 초안\n\n${summary}\n\n## 호텔 공식 페이지\n\n${officialUrl || '공식 URL 미입력'}\n\n## 사실 및 확인 상태\n\n${factsBlock}\n\n## 출처\n\n${sourceBlock}\n\n## 제휴 링크 상태\n\n${affiliateUrl ? `입력된 URL: ${affiliateUrl}\n\n승인된 계정과 목적지 URL인지 별도로 검증하세요.` : '승인된 아고다 제휴 URL 미입력. URL을 추측하거나 임의로 만들지 마세요.'}\n\n## 이미지 권리\n\n- 상태: ${imageRights}\n- 사용 권한이 확인되지 않았다면 이미지를 공개하지 마세요.\n\n## 게시 전 체크리스트\n\n- [ ] 호텔 운영 상태와 공식 정보 확인\n- [ ] 위치·교통 정보의 출처와 확인 날짜 기록\n- [ ] 가격·객실 재고·평점·리뷰 수의 실시간 사실성 확인\n- [ ] 이미지 이용 권한 확인\n- [ ] 제휴 링크와 고지 확인\n- [ ] 독창적인 편집 가치와 중복 콘텐츠 검토\n- [ ] 편집자 승인 후 게시\n`;

  const filename = `${
    name
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '') || 'hotel'
  }-review-draft.md`;

  return { markdown, filename };
};

export const setupDraft = (
  form: Element | null,
  previewPanel: Element | null,
  preview: Element | null,
  status: Element | null,
) => {
  if (!(form instanceof HTMLFormElement)) return;
  if (!(previewPanel instanceof HTMLElement)) return;
  if (!(preview instanceof HTMLElement)) return;
  if (!(status instanceof HTMLElement)) return;

  let latestMarkdown = '';
  let latestFilename = 'hotel-review-draft.md';

  const field = (name: string) =>
    String(new FormData(form).get(name) ?? '').trim();

  const download = () => {
    const blob = new Blob([latestMarkdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = latestFilename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = field('name');
    const city = field('city');
    const summary = field('summary');
    if (summary.length < 40) {
      status.textContent = '소개 요약은 40자 이상 입력해야 합니다.';
      return;
    }
    const officialUrl = field('officialUrl');
    const sources = parseSources(field('sources'));
    const facts = parseFacts(field('facts'));
    const imageRights = field('imageRights');
    const affiliateUrl = field('affiliateUrl');
    const validOfficial = !officialUrl || /^https?:\/\//i.test(officialUrl);
    const validAffiliate =
      !affiliateUrl || /^https?:\/\//i.test(affiliateUrl);
    if (!validOfficial || !validAffiliate) {
      status.textContent = 'URL은 http:// 또는 https:// 형식이어야 합니다.';
      return;
    }
    const { markdown, filename } = generateDraft({
      name,
      city,
      summary,
      officialUrl,
      sources,
      facts,
      imageRights,
      affiliateUrl,
    });
    latestMarkdown = markdown;
    latestFilename = filename;
    preview.textContent = latestMarkdown;
    previewPanel.hidden = false;
    status.textContent =
      '초안이 생성되었습니다. 검토 상태이며 사이트에 게시되지 않았습니다.';
    download();
  });
  document
    .querySelector('#download-again')
    ?.addEventListener('click', () => {
      if (latestMarkdown) download();
    });
  document
    .querySelector('#reset-form')
    ?.addEventListener('click', () => {
      previewPanel.hidden = true;
      status.textContent =
        '입력이 지워졌습니다. 초안은 자동 게시되지 않습니다.';
      latestMarkdown = '';
    });
};
