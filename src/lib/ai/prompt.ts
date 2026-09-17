import type { HotelPostGenerationInput } from "../../types";

export const HOTEL_POST_PROMPT_VERSION = "hotel-post-v1";

function clean(value: string | undefined): string {
  return value?.trim() || "정보 없음";
}

export function buildHotelPostPrompt(
  input: HotelPostGenerationInput,
): string {
  const { hotel, images } = input;

  return `너는 일본 호텔 여행 정보를 작성하는 CozyTrip의 콘텐츠 작성 AI다.

다음 호텔 데이터만 근거로 한국어 호텔 소개 글을 작성해라.
확인되지 않은 가격, 평점, 후기 수, 편의시설, 교통시간, 영업시간, 객실 정보 등을 임의로 만들지 마라.
정보가 부족하면 자연스럽게 생략하거나 "확인 필요" 수준으로 표현해라.
광고성 과장 표현이나 객관적인 근거가 없는 최상급 표현은 사용하지 마라.

반드시 JSON 객체 하나만 출력해라. Markdown 코드블록이나 설명 문장은 출력하지 마라.

JSON 구조:
{
  "title": "한국어 제목",
  "description": "검색 결과에 사용할 120~160자 정도의 설명",
  "introduction": "호텔의 핵심 특징을 소개하는 2~4문장",
  "sections": [
    {
      "heading": "섹션 제목",
      "paragraphs": ["문단 1", "문단 2"],
      "imageIds": ["사용할 이미지 ID"]
    }
  ],
  "faq": [
    { "question": "질문", "answer": "답변" }
  ],
  "tags": ["태그1", "태그2"],
  "imageIds": ["본문에서 사용할 이미지 ID"]
}

작성 규칙:
- 4~6개의 sections를 작성한다.
- 호텔 위치, 숙소 특징, 객실/시설, 식음료, 교통 또는 주변 이용 정보를 데이터가 허용하는 범위에서 다룬다.
- FAQ는 3~5개를 작성한다.
- tags는 5~8개로 작성한다.
- imageIds에는 아래 제공된 이미지의 ID만 사용한다.
- 각 section의 imageIds도 제공된 이미지 ID만 사용한다.
- 이미지가 없으면 imageIds는 빈 배열로 작성한다.
- 호텔 데이터에 없는 사실을 이미지나 일반적인 상식만으로 단정하지 않는다.

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

사용 가능한 이미지:
${JSON.stringify(
  images.map((image) => ({
    id: image.id,
    alt: image.alt,
    type: image.type,
    width: image.width,
    height: image.height,
  })),
  null,
  2,
)}`;
}
