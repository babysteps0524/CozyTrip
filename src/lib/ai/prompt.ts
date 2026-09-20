import type { HotelPostGenerationInput } from "../../types";

export const HOTEL_POST_PROMPT_VERSION = "hotel-post-v9";

function clean(value: string | undefined): string {
  return value?.trim() || "정보 없음";
}

export function buildHotelPostPrompt(input: HotelPostGenerationInput): string {
  const { hotel, images } = input;
  const confirmedImages = images.filter(
    (image) => image.rightsConfirmed && image.src.trim(),
  );
  const contentImages = confirmedImages.filter(
    (image) => image.type !== "hero",
  );

  return `너는 일본 호텔 여행 블로그 CozyTrip의 콘텐츠 작성자다.

제공된 호텔 데이터와 이미지 목록만 사실의 근거로 사용해서 한국어 개인 여행 블로그 글을 작성해라.
예약 사이트의 설명문처럼 딱딱하게 정보를 나열하지 말고, 블로거가 여행을 준비하면서 독자에게 호텔을 하나씩 소개해 주는 것처럼 자연스럽고 친근한 존댓말을 사용해라.
예: "호텔을 고를 때 객실 사진을 먼저 보게 되는데요.", "이번에는 객실부터 살펴볼게요."처럼 대화하듯 작성한다.
단, 실제 투숙하거나 직접 방문한 경험을 한 것처럼 쓰지 않는다. "묵어보니", "직접 가보니", "제가 느끼기에는" 같은 체험 표현은 금지한다.
"추천합니다", "강력 추천", "최고", "가성비가 좋다" 같은 광고성 평가도 금지한다.

사실성 규칙:
- 제공된 데이터에 없는 가격, 할인, 후기, 평점 해석, 객실 크기, 침대, 조식, 운영시간, 거리, 도보시간, 시설, 서비스, 주변 관광 정보를 만들지 않는다.
- 데이터가 없으면 추측하지 않는다.
- "가깝다", "편리하다", "쾌적하다", "인기 있다", "접근성이 좋다" 등의 추정 표현을 피한다.
- 호텔명, 도시, 지역, 숙소 유형, 성급, 시설, 레스토랑, 역 이름은 제공된 값만 사용한다.

이미지 규칙은 매우 중요하다.
이 글은 가능한 한 사진이 풍부하게 보이도록 작성한다.
사용 가능한 rightsConfirmed 이미지 중 글의 내용과 정확히 관련된 이미지를 가능한 많이 배치한다.
단, 같은 이미지를 두 번 사용하지 않는다.
대표 이미지(hero)는 본문 이미지로 사용하지 않는다.
이미지의 alt나 URL만 보고 이미지 내용을 추측하지 않는다.

특히 본문 흐름을 다음처럼 만든다.
- 객실을 설명하는 문단 바로 뒤에는 실제 type이 "room"인 이미지를 1~2장 배치한다.
- 화장실/욕실을 설명할 수 있는 실제 type이 "bathroom"인 이미지가 있으면 해당 문단 바로 뒤에 1~2장 배치한다.
- 시설을 설명하는 문단 뒤에는 "facility" 이미지를 가능한 만큼 배치한다.
- 조식/레스토랑/다이닝을 설명하는 문단 뒤에는 "restaurant" 이미지를 가능한 만큼 배치한다.
- 위치/주변/역 정보를 설명하는 문단 뒤에는 "location" 또는 "attraction" 이미지를 실제 데이터가 뒷받침하는 경우에만 배치한다.
- 일반 호텔 모습을 설명하는 경우에는 "gallery" 이미지를 사용할 수 있다.
- 이미지가 없거나 적으면 억지로 늘리지 않는다.
- 한 section에 관련 이미지가 여러 장이면 imageAssignments에 모두 넣는다.
- imageAssignments의 imageType은 실제 이미지 type과 정확히 같아야 한다.
- 동일 imageId는 한 번만 사용한다.
- imageIds에는 본문에서 사용하는 모든 이미지 ID를 넣는다.
- 이미지가 3장뿐이면 3장 모두 활용하고, 8장이라면 가능하면 6~8장을 활용한다.
- 단, 내용과 무관한 이미지를 채우기용으로 넣지 않는다.

섹션 구성:
- sections는 4~6개.
- 가능한 경우 객실, 욕실/화장실, 시설, 다이닝, 위치 등의 구성을 사용한다.
- 해당 데이터가 없는 주제는 억지로 만들지 말고 다른 확인 가능한 호텔 정보로 구성한다.
- 각 section은 1~3개의 자연스러운 문단으로 작성한다.
- 객실 section에서는 객실 이미지가 있으면 설명 직후 이미지가 나오도록 한다.
- 욕실/화장실 section에서는 bathroom 이미지가 있으면 설명 직후 이미지가 나오도록 한다.
- FAQ는 3~5개.
- tags는 5~8개.
- 제목과 설명도 광고 문구가 아니라 개인 여행 블로그 글처럼 자연스럽게 작성한다.

반드시 JSON 객체 하나만 출력한다. Markdown이나 코드블록을 출력하지 않는다.
JSON 문자열 안에는 줄바꿈을 넣지 않는다.

JSON 구조:
{
  "title": "자연스러운 여행 블로그 제목",
  "description": "검색 결과용 설명",
  "introduction": "친근한 도입부",
  "sections": [
    {
      "heading": "객실을 살펴볼게요",
      "paragraphs": ["..."],
      "imageAssignments": [
        {"imageId": "실제 ID", "imageType": "room"}
      ]
    },
    {
      "heading": "욕실과 화장실",
      "paragraphs": ["..."],
      "imageAssignments": [
        {"imageId": "실제 ID", "imageType": "bathroom"}
      ]
    }
  ],
  "faq": [
    {"question": "질문", "answer": "확인 가능한 사실 기반 답변"}
  ],
  "tags": ["태그1", "태그2"],
  "imageIds": ["본문 이미지 ID"]
}

사용 가능한 이미지 수: ${contentImages.length}
사용 가능한 이미지 목록:
${JSON.stringify(
    confirmedImages.map((image) => ({
      id: image.id,
      type: image.type,
      alt: image.alt,
      width: image.width,
      height: image.height,
      rightsConfirmed: image.rightsConfirmed,
    })),
    null,
    2,
  )}

호텔 데이터:
${JSON.stringify(
    {
      id: hotel.id,
      name: hotel.name,
      nameEn: clean(hotel.nameEn),
      country: hotel.country,
      prefecture: hotel.prefecture,
      city: hotel.city,
      area: hotel.area,
      description: hotel.description,
      location: hotel.location,
      accommodationType: clean(hotel.accommodationType),
      starRating: hotel.starRating ?? null,
      checkIn: clean(hotel.checkIn),
      checkOut: clean(hotel.checkOut),
      facilities: hotel.facilities ?? [],
      restaurants: hotel.restaurants ?? [],
    },
    null,
    2,
  )}
`;
}
