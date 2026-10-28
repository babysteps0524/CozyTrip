export const site = {
  name: 'CozyTrip',
  tagline: '일본 호텔과 여행을 더 쉽게',
  description:
    '일본 여행을 계획하는 사람을 위한 호텔 선택 가이드, 지역별 여행 정보, 예약 전 체크리스트를 소개합니다.',
  url: 'https://cozytrip.kr',
};

export const regions = [
  {
    slug: 'tokyo',
    name: '도쿄',
    en: 'Tokyo',
    subtitle: '도시의 에너지와 다양한 숙소',
    image:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=85',
    intro:
      '첫 일본 여행부터 쇼핑과 미식 여행까지, 이동 동선과 숙박 목적에 맞춰 도쿄의 숙소를 살펴보세요.',
    areas: ['신주쿠', '시부야', '긴자', '우에노'],
  },
  {
    slug: 'osaka',
    name: '오사카',
    en: 'Osaka',
    subtitle: '먹거리와 쇼핑을 즐기는 여행',
    image:
      'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=900&q=85',
    intro:
      '난바·우메다 등 주요 거점과 공항 이동, 교토·고베 당일치기 계획을 함께 고려해 숙소를 선택하세요.',
    areas: ['난바', '우메다', '신사이바시', '덴노지'],
  },
  {
    slug: 'kyoto',
    name: '교토',
    en: 'Kyoto',
    subtitle: '전통 거리와 사계절의 풍경',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85',
    intro:
      '사찰과 전통 거리, 대중교통 접근성, 료칸 경험 중 여행에서 중요하게 생각하는 기준을 먼저 정해보세요.',
    areas: ['교토역', '기온', '가와라마치', '아라시야마'],
  },
  {
    slug: 'fukuoka',
    name: '후쿠오카',
    en: 'Fukuoka',
    subtitle: '짧은 일정에 잘 어울리는 도시',
    image:
      'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=900&q=85',
    intro:
      '공항과 시내의 거리가 비교적 가까운 편이지만, 실제 이동 시간은 목적지와 교통수단을 기준으로 확인하세요.',
    areas: ['하카타', '텐진', '나카스', '모모치'],
  },
  {
    slug: 'sapporo',
    name: '삿포로',
    en: 'Sapporo',
    subtitle: '겨울 풍경과 홋카이도 미식',
    image:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=85',
    intro:
      '계절과 적설, 공항 이동, 근교 여행 여부를 함께 고려해 숙소 위치를 결정하는 것이 좋습니다.',
    areas: ['삿포로역', '오도리', '스스키노', '조잔케이'],
  },
  {
    slug: 'okinawa',
    name: '오키나와',
    en: 'Okinawa',
    subtitle: '바다와 리조트 중심의 휴식',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85',
    intro:
      '리조트 휴식과 도시 관광 중 어떤 일정인지에 따라 지역과 교통수단 선택이 달라집니다.',
    areas: ['나하', '온나손', '차탄', '이시가키'],
  },
];

export const hotels = [
  {
    slug: 'hotel-gracery-shinjuku',
    name: '호텔 그레이서리 신주쿠',
    city: '도쿄',
    region: 'tokyo',
    area: '신주쿠',
    type: '도시 호텔',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',
    summary:
      '신주쿠 일대를 중심으로 여행 동선을 짜는 사람이라면 위치와 교통편을 먼저 비교해 볼 숙소 후보입니다.',
    tags: ['도심 여행', '쇼핑', '교통 확인'],
    status: 'draft',
    sourceNote:
      '호텔명과 지역은 편집 후보입니다. 객실·시설·요금·예약 조건은 공식 페이지와 예약 페이지에서 확인 후 게시하세요.',
  },
  {
    slug: 'cross-hotel-kyoto',
    name: '크로스 호텔 교토',
    city: '교토',
    region: 'kyoto',
    area: '가와라마치 인근',
    type: '도시 호텔',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85',
    summary:
      '교토 중심부에서 관광지와 식당을 함께 살펴보려는 여행객에게 검토할 만한 숙소 후보입니다.',
    tags: ['도심 산책', '미식', '위치 확인'],
    status: 'draft',
    sourceNote:
      '주변 시설·도보 시간·객실 정보는 게시 전에 공식 출처로 재검증해야 합니다.',
  },
  {
    slug: 'the-prince-park-tower-tokyo',
    name: '더 프린스 파크 타워 도쿄',
    city: '도쿄',
    region: 'tokyo',
    area: '시바 공원 일대',
    type: '도시 호텔',
    image:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
    summary:
      '도쿄의 주요 명소를 둘러보는 일정이라면 호텔 위치와 이동 경로를 기준으로 비교해 볼 수 있습니다.',
    tags: ['도쿄 관광', '숙소 비교', '교통 확인'],
    status: 'draft',
    sourceNote:
      '전망·시설·서비스 등은 확인된 출처가 없으므로 이 소개에서 단정하지 않습니다.',
  },
  {
    slug: 'hyatt-regency-seragaki',
    name: '하얏트 리젠시 세라가키 아일랜드 오키나와',
    city: '오키나와',
    region: 'okinawa',
    area: '온나손',
    type: '리조트',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85',
    summary:
      '리조트 중심의 휴식을 계획한다면 섬 내 이동 방법과 숙박 조건을 함께 확인해 보세요.',
    tags: ['리조트 여행', '휴식', '예약 조건 확인'],
    status: 'draft',
    sourceNote:
      '객실·수영장·식사·가격 등의 세부 사항은 최신 공식 정보로 확인 후 게시해야 합니다.',
  },
  {
    slug: 'hotel-nikko-fukuoka',
    name: '호텔 닛코 후쿠오카',
    city: '후쿠오카',
    region: 'fukuoka',
    area: '하카타',
    type: '도시 호텔',
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85',
    summary:
      '하카타역 주변을 거점으로 후쿠오카와 근교를 둘러볼 때 위치를 비교할 후보입니다.',
    tags: ['하카타', '도시 여행', '이동 동선'],
    status: 'draft',
    sourceNote:
      '역 연결·도보 시간·시설은 출처를 확인하기 전까지 확정 정보로 사용하지 않습니다.',
  },
  {
    slug: 'sapporo-grand-hotel',
    name: '삿포로 그랜드 호텔',
    city: '삿포로',
    region: 'sapporo',
    area: '삿포로 중심부',
    type: '도시 호텔',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=85',
    summary:
      '도심 관광과 식사를 중심으로 삿포로 일정을 구성한다면 위치와 계절별 이동을 비교해 보세요.',
    tags: ['홋카이도', '도심 여행', '계절 확인'],
    status: 'draft',
    sourceNote:
      '요금·운영 상태·시설 정보는 게시 전에 최신 출처로 검증해야 합니다.',
  },
];

export const guides = [
  {
    slug: 'first-time-japan-hotel-guide',
    title: '일본 첫 여행, 호텔 위치를 정하는 7가지 기준',
    category: '숙소 선택',
    readTime: '7분',
    excerpt:
      '가격만 보기 전에 공항 이동, 주요 일정, 체크인 시간, 짐 보관과 취소 조건을 함께 비교해 보세요.',
    image:
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1000&q=85',
    updated: '2026-10-20',
  },
  {
    slug: 'japan-hotel-booking-checklist',
    title: '일본 호텔 예약 전 확인할 체크리스트',
    category: '예약 팁',
    readTime: '5분',
    excerpt:
      '객실 인원, 세금 포함 여부, 취소 마감, 결제 시점과 숙박자 이름 표기를 체크하는 방법입니다.',
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85',
    updated: '2026-10-20',
  },
  {
    slug: 'tokyo-area-selection',
    title: '도쿄 숙소 지역 선택: 일정부터 역까지',
    category: '지역 가이드',
    readTime: '8분',
    excerpt:
      '하루 일정과 이동 경로를 먼저 정한 뒤 숙소 후보 지역을 좁히는 실용적인 순서를 소개합니다.',
    image:
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=85',
    updated: '2026-10-20',
  },
  {
    slug: 'ryokan-etiquette-basics',
    title: '료칸 예약 전에 알아둘 기본 예절과 조건',
    category: '숙소 유형',
    readTime: '6분',
    excerpt:
      '식사 포함 여부, 온천 이용 규칙, 객실 유형, 체크인 시간 등 숙소마다 달라질 수 있는 항목을 확인하세요.',
    image:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1000&q=85',
    updated: '2026-10-20',
  },
];
