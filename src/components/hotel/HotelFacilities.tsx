import type { Hotel, HotelFacility } from "../../types";
import { Container } from "../common";

interface HotelFacilitiesProps {
  hotel: Hotel;
}

interface FacilityGroup {
  key: string;
  label: string;
  items: HotelFacility[];
}

const GROUP_LABELS: Record<string, string> = {
  pool: "수영장",
  fitness: "피트니스",
  dining: "다이닝",
  parking: "주차",
  front: "프런트 · 서비스",
  room: "객실",
  business: "비즈니스",
  family: "가족 편의",
  accessibility: "편의시설",
  other: "기타",
};

const GROUP_ORDER = [
  "pool",
  "fitness",
  "dining",
  "parking",
  "front",
  "room",
  "business",
  "family",
  "accessibility",
  "other",
];

function normalizeGroup(group?: string): string {
  const value = group?.trim().toLowerCase();

  if (!value) {
    return "other";
  }

  if (GROUP_LABELS[value]) {
    return value;
  }

  return "other";
}

function groupFacilities(facilities: HotelFacility[]): FacilityGroup[] {
  const groups = new Map<string, HotelFacility[]>();

  for (const facility of facilities) {
    const key = normalizeGroup(facility.group);
    const current = groups.get(key) ?? [];
    current.push(facility);
    groups.set(key, current);
  }

  return GROUP_ORDER.filter((key) => groups.has(key)).map((key) => ({
    key,
    label: GROUP_LABELS[key],
    items: groups.get(key) ?? [],
  }));
}

function getFacilitySymbol(group: string): string {
  const symbols: Record<string, string> = {
    pool: "POOL",
    fitness: "FIT",
    dining: "DIN",
    parking: "P",
    front: "INFO",
    room: "ROOM",
    business: "BIZ",
    family: "FAM",
    accessibility: "CARE",
    other: "INFO",
  };

  return symbols[group] ?? "INFO";
}

export default function HotelFacilities({ hotel }: HotelFacilitiesProps) {
  const facilities = hotel.facilities ?? [];

  if (facilities.length === 0) {
    return null;
  }

  const groups = groupFacilities(facilities);

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
            FACILITIES
          </p>

          <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
            주요 시설
          </h2>

          <div mt="8" flex="~ col" gap="8">
            {groups.map((group) => (
              <section key={group.key} aria-labelledby={`facility-${group.key}`}>
                <div flex="~" items="center" gap="3">
                  <span
                    inline-flex
                    items="center"
                    justify="center"
                    min-w="12"
                    h="8"
                    rounded="full"
                    border="~ ct-line dark:ct-dark-line"
                    bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                    text="xs ct-primary dark:ct-dark-text"
                    font="bold"
                    tracking="wide"
                  >
                    {getFacilitySymbol(group.key)}
                  </span>
                  <h3
                    id={`facility-${group.key}`}
                    m="0"
                    text="lg ct-text dark:ct-dark-text"
                    font="bold"
                  >
                    {group.label}
                  </h3>
                </div>

                <div mt="4" grid="~ cols-1 sm:2 lg:3" gap="3">
                  {group.items.map((facility) => (
                    <article
                      key={`${group.key}-${facility.name}`}
                      rounded="xl"
                      border="~ ct-line dark:ct-dark-line"
                      bg="ct-surface dark:ct-dark-surface"
                      p="4 sm:5"
                    >
                      <h4 m="0" text="sm ct-text dark:ct-dark-text" font="semibold">
                        {facility.name}
                      </h4>

                      {facility.description && (
                        <p
                          mt="2"
                          mb="0"
                          text="sm ct-text-soft dark:ct-dark-text-soft"
                          leading="relaxed"
                        >
                          {facility.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
