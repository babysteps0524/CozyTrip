import { getPostsByCategory } from "../data";

import { Container, Section } from "../components/common";

import { PostCard } from "../components/post";

export default function Guides() {
  const guides = getPostsByCategory("guide");

  return (
    <>
      <Section>
        <Container>
          <div max-w="3xl" py="8 sm:12 lg:16">
            <p
              m="0"
              text="sm ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              TRAVEL GUIDES
            </p>

            <h1
              mt="3"
              mb="0"
              text="4xl sm:5xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              일본 여행 가이드
            </h1>

            <p
              mt="5"
              mb="0"
              max-w="2xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              일본 여행지와 호텔을 선택할 때 참고할 수 있는 여행 정보를
              확인하세요.
            </p>
          </div>
        </Container>
      </Section>

      <Section borderTop surface>
        <Container>
          {guides.length > 0 ? (
            <div grid="~ cols-1 md:2 lg:3" gap="4 lg:6">
              {guides.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div
              rounded="card"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface"
              p="8"
              text="center"
            >
              <p m="0" text="sm ct-muted dark:ct-dark-muted">
                여행 가이드를 준비하고 있습니다.
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
