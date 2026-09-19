import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelLocationProps { hotel: Hotel; }

function getMapUrl(latitude?: number, longitude?: number, address?: string): string | null {
  if (latitude !== undefined && longitude !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }
  if (address?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  }
  return null;
}

function getLocationLabel(city?: string, area?: string): string {
  const values = [city?.trim(), area?.trim()].filter(Boolean) as string[];
  return [...new Set(values)].join(" · ");
}

export default function HotelLocation({ hotel }: HotelLocationProps) {
  const { location } = hotel;
  const mapUrl = getMapUrl(location.latitude, location.longitude, location.address);
  const areaLabel = getLocationLabel(location.city, location.area);
  const stations = location.nearestStations?.filter(Boolean) ?? [];
  const hasCoordinates = location.latitude !== undefined && location.longitude !== undefined;

  return (
    <section id="location" aria-labelledby="hotel-location-title" border="t ct-line dark:ct-dark-line" bg="ct-surface-soft dark:ct-dark-surface-soft">
      <Container>
        <div py="12 sm:16 lg:20">
          <div flex="~ col sm:row" sm="items-end justify-between" gap="3">
            <div>
              <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">LOCATION</p>
              <h2 id="hotel-location-title" mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">위치 정보</h2>
            </div>
            <span text="xs ct-muted dark:ct-dark-muted">제공된 호텔 정보 기준</span>
          </div>

          <div mt="8" grid="~ cols-1 lg:2" gap="5 lg:6">
            <div rounded="card" border="~ ct-line dark:ct-dark-line" bg="ct-surface dark:ct-dark-surface" p="6">
              <p m="0" text="xs ct-muted dark:ct-dark-muted" font="medium">지역</p>
              <p mt="2" mb="0" text="lg ct-text dark:ct-dark-text" font="bold" leading="relaxed">
                {areaLabel || "지역 정보 없음"}
              </p>
              {location.prefecture && <p mt="1" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">{location.country} · {location.prefecture}</p>}

              {location.address ? (
                <div mt="6" border-t="~ ct-line dark:ct-dark-line" pt="5">
                  <p m="0" text="xs ct-muted dark:ct-dark-muted" font="medium">주소</p>
                  <p mt="2" mb="0" text="sm ct-text dark:ct-dark-text" leading="relaxed">{location.address}</p>
                </div>
              ) : (
                <p mt="6" mb="0" border-t="~ ct-line dark:ct-dark-line" pt="5" text="sm ct-muted dark:ct-dark-muted" leading="relaxed">등록된 상세 주소가 없습니다.</p>
              )}

              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`${hotel.name} 지도에서 위치 확인`} mt="6" display="inline-flex" items="center" justify="center" min-h="11" rounded="xl" bg="ct-text dark:bg-ct-dark-text" px="5" py="3" text="sm ct-surface dark:text-ct-dark-bg" font="bold" hover="opacity-85" active-scale="98" className="ct-focus">지도에서 위치 확인</a>
              )}
            </div>

            <div rounded="card" border="~ ct-line dark:ct-dark-line" bg="ct-surface dark:bg-ct-dark-surface" p="6">
              <p m="0" text="xs ct-muted dark:ct-dark-muted" font="medium">가까운 역</p>
              {stations.length > 0 ? (
                <ul mt="4" mb="0" list="none" p="0" divide="y ct-line dark:divide-ct-dark-line">
                  {stations.map((station,index)=>(
                    <li key={`${station}-${index}`} flex="~" items="start" gap="3" py="3" first:pt="0" last:pb="0">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ct-primary-soft text-xs font-bold text-ct-primary dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">{index + 1}</span>
                      <span min-w="0" text="sm ct-text dark:ct-dark-text" leading="relaxed">{station}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div mt="4" rounded="xl" bg="ct-surface-soft dark:bg-ct-dark-surface-soft" px="4" py="4"><p m="0" text="sm ct-muted dark:ct-dark-muted">등록된 역 정보가 없습니다.</p></div>
              )}
              <p mt="6" mb="0" text="xs ct-muted dark:ct-dark-muted" leading="relaxed">가까운 역 정보는 제공된 호텔 데이터에 등록된 내용을 표시합니다. 이동 시간이나 실제 경로는 지도와 현지 안내를 함께 확인해 주세요.</p>
            </div>
          </div>

          {hasCoordinates && <p mt="4" mb="0" text="xs ct-muted dark:ct-dark-muted" leading="relaxed">지도 위치는 제공된 좌표를 기준으로 연결됩니다.</p>}
        </div>
      </Container>
    </section>
  );
}
