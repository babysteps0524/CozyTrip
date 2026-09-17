import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelStayInfoProps {
  hotel: Hotel;
}

interface InfoCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function InfoCard({ label, value, accent = false }: InfoCardProps) {
  return (
    <div
      rounded="xl"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
      p="5"
    >
      <p m="0" text="sm ct-muted dark:ct-dark-muted">
        {label}
      </p>
      <p
        mt="2"
        mb="0"
        text={accent ? "lg ct-primary dark:ct-dark-text" : "lg ct-text dark:ct-dark-text"}
        font="bold"
      >
        {value}
      </p>
    </div>
  );
}

function NoticeList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      rounded="xl"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
      p="5"
    >
      <h3 m="0" text="base ct-text dark:ct-dark-text" font="bold">
        {title}
      </h3>
      <ul
        mt="3"
        mb="0"
        pl="5"
        text="sm ct-text-soft dark:ct-dark-text-soft"
        leading="relaxed"
      >
        {items.map((item, index) => (
          <li key={`${item}-${index}`} mb={index < items.length - 1 ? "2" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HotelStayInfo({ hotel }: HotelStayInfoProps) {
  const hasCheckIn = Boolean(hotel.checkIn);
  const hasCheckOut = Boolean(hotel.checkOut);
  const policy = hotel.policy;
  const hasPolicy = Boolean(
    policy?.childPolicy || policy?.extraFees?.length || policy?.bookingNotes?.length,
  );

  if (!hasCheckIn && !hasCheckOut && !hasPolicy) {
    return null;
  }

  return (
    <section border="t ct-line dark:ct-dark-line">
      <Container>
        <div py="12 sm:16 lg:20">
          <p
            m="0"
            text="xs ct-primary dark:ct-dark-text-soft"
            font="medium"
            tracking="wide"
          >
            USEFUL INFORMATION
          </p>
          <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
            이용 안내
          </h2>
          <p
            mt="3"
            mb="0"
            max-w="2xl"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            숙박 전 확인하면 좋은 체크인·체크아웃과 예약 관련 안내입니다.
          </p>

          {(hasCheckIn || hasCheckOut) && (
            <div mt="8" grid="~ cols-1 sm:2" gap="4">
              {hasCheckIn && <InfoCard label="체크인" value={hotel.checkIn!} accent />}
              {hasCheckOut && <InfoCard label="체크아웃" value={hotel.checkOut!} />}
            </div>
          )}

          {hasPolicy && (
            <div mt="4" grid="~ cols-1 md:2" gap="4">
              {policy?.childPolicy && (
                <InfoCard label="어린이 정책" value={policy.childPolicy} />
              )}

              <NoticeList title="추가 요금 안내" items={policy?.extraFees ?? []} />
              <NoticeList title="예약 전 확인사항" items={policy?.bookingNotes ?? []} />
            </div>
          )}

          <p
            mt="6"
            mb="0"
            text="xs ct-muted dark:ct-dark-muted"
            leading="relaxed"
          >
            실제 적용 조건과 요금은 예약 시점의 숙소 및 예약 플랫폼 안내를 확인해 주세요.
          </p>
        </div>
      </Container>
    </section>
  );
}
