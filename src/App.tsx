import { Container, Section } from "./components/common";

import { Footer, Header } from "./components/layout";

export default function App() {
  return (
    <div
      min-h="screen"
      overflow-x="hidden"
      bg="ct-bg"
      text="ct-text"
      dark="bg-ct-dark-bg text-ct-dark-text"
    >
      <Header />

      <main>
        <Section>
          <Container>
            <div max-w="3xl">
              <p
                mb="3"
                text="sm ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                TRAVEL · HOTELS · JAPAN
              </p>

              <h1
                m="0"
                text="3xl sm:4xl lg:5xl"
                font="bold"
                tracking="tight"
                leading="tight"
              >
                일본 여행의 시작을
                <br />
                조금 더 편안하게
              </h1>

              <p
                mt="5"
                max-w="2xl"
                text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
                leading="relaxed"
              >
                일본의 호텔과 여행 정보를 직접 비교하고 여행 목적에 맞는 숙소를
                찾아보세요.
              </p>

              <div mt="8" flex="~ wrap" gap="3">
                <a
                  href="/japan/tokyo/hotels/"
                  ct-button
                  bg="ct-primary"
                  text="white"
                  hover="bg-ct-primary-dark"
                  un-active="scale-0.95"
                >
                  도쿄 호텔 보기
                </a>

                <a
                  href="/guides/"
                  ct-button
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  text="ct-text dark:ct-dark-text"
                  hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                  un-active="scale-0.95"
                >
                  여행 가이드 보기
                </a>
              </div>
            </div>
          </Container>
        </Section>

        <Section borderTop surface>
          <Container>
            <p m="0" text="sm ct-muted dark:ct-dark-muted">
              CozyTrip · Japan Travel & Hotel Guide
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
