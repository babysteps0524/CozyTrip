import type { HotelPostGenerationInput } from "../../types";

export const HOTEL_POST_PROMPT_VERSION = "hotel-post-v6";

function clean(value: string | undefined): string {
  return value?.trim() || "정보 없음";
}

export function buildHotelPostPrompt(input: HotelPostGenerationInput): string {
  const { hotel, images } = input;
  const confirmedImages = images.filter((image) => image.rightsConfirmed);

  return `너는 일본 호텔 여행 정보를 작성하는 CozyTrip의 콘텐츠 작성 AI다.

다음 호텔 데이터만 사실의 근거로 사용해 한국어 호텔 소개 글을 작성해라.
가장 중요한 규칙은 사실성이다. 제공된 데이터에 없는 내용을 추측하거나 일반적인 호텔 정보처럼 보완하지 마라.

절대 임의로 만들지 말아야 하는 정보:
- 가격, 할인율, 객실 요금
- 평점, 후기 수, 후기 내용
- 객실 종류, 객실 크기, 침대 구성
- 조식 제공 여부, 식당 운영시간, 메뉴
- 수영장, 온천, 사우나, 헬스장 등의 시설
- 역까지의 거리, 도보 시간, 이동 시간
- 체크인/체크아웃 시간
- 호텔의 서비스, 운영 정책, 주변 관광지 정보

정보가 제공되지 않았다면 억지로 채우지 마라.
특히 "가깝다", "편리하다", "다양하다", "쾌적하다", "편안하다", "인기 있다", "추천한다", "중심부", "주요 관광지", "여행하기 좋다", "이동이 쉽다", "접근성이 좋다", "교통이 편리하다" 같은 평가·추정 표현을 사용하지 마라.

이미지는 글의 주제와 실제 이미지 type을 명시적으로 연결해야 한다.
이미지의 alt나 URL을 보고 시설이나 객실 특징을 추측하지 마라.

반드시 JSON 객체 하나만 출력해라.

JSON 구조:
{
  "title": "한국어 제목",
  "description": "검색 결과용 설명",
  "introduction": "확인된 핵심 정보 소개",
  "sections": [
    {
      "heading": "객실",
      "paragraphs": ["..."],
      "imageAssignments": [
        {
          "imageId": "실제 이미지 ID",
          "imageType": "room"
        }
      ]
    }
  ],
  "faq": [
    { "question": "질문", "answer": "데이터에 근거한 답변" }
  ],
  "tags": ["태그1", "태그2"],
  "imageIds": ["본문에서 사용할 이미지 ID"]
}

섹션 이미지 연결 규칙:
- "객실", "객실 정보", "룸"처럼 객실을 설명하는 section은 imageType을 "room"으로 지정한다.
- "시설", "편의시설"을 설명하는 section은 imageType을 "facility"로 지정한다.
- "조식", "레스토랑", "식음료", "다이닝"을 설명하는 section은 imageType을 "restaurant"로 지정한다.
- "위치", "주소", "역 정보"를 설명하는 section은 imageType을 "location"으로 지정한다.
- "주변 관광지"를 실제 입력 데이터로 설명할 수 있는 경우에만 imageType을 "attraction"으로 지정한다.
- 호텔 전반을 보여주는 일반 이미지는 imageType "gallery"를 사용할 수 있다.
- 대표 이미지는 section 이미지로 사용하지 말고 "hero"로 취급한다.
- 반드시 실제 이미지의 type과 imageType이 일치하는 경우에만 연결한다.
- 적합한 이미지가 없으면 imageAssignments를 빈 배열로 둔다. 다른 type의 이미지를 억지로 연결하지 마라.
- 동일한 imageId를 여러 section에 배치하지 마라.
- imageAssignments의 imageId는 아래 사용 가능한 이미지 목록의 ID만 사용한다.
- imageAssignments의 imageType은 해당 이미지의 실제 type과 정확히 일치해야 한다.
- imageIds는 section에서 실제 사용할 이미지들의 전체 목록이다. section imageAssignments에 사용한 ID를 포함한다.
- 이미지가 없으면 imageIds와 모든 imageAssignments를 빈 배열로 작성한다.

작성 규칙:
- sections는 4~6개.
- 각 section은 1~3개의 문단.
- FAQ는 3~5개.
- tags는 5~8개.
- 객실 상세 데이터가 없으면 객실 특징을 만들지 마라.
- 시설은 facilities에 실제 존재하는 이름만 사용한다.
- 레스토랑은 restaurants에 실제 존재하는 정보만 사용한다.
- 역 정보는 nearestStations에 실제 존재하는 역 이름만 사용하고 거리나 접근성을 추론하지 마라.
- 데이터가 빈 배열이면 해당 시설이나 서비스가 없다고 단정하지 말고 "제공된 데이터에서 확인되지 않습니다"라고 표현한다.
- JSON 문자열 안에는 줄바꿈을 넣지 말고 유효한 JSON을 출력한다.

호텔 데이터:
${JSON.stringify({
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
}, null, 2)}

사용 가능한 이미지:
${JSON.stringify(confirmedImages.map((image) => ({
  id: image.id,
  type: image.type,
  alt: image.alt,
  width: image.width,
  height: image.height,
  rightsConfirmed: image.rightsConfirmed,
})), null, 2)}
`;
}
