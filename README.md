# 🎣 Crossy Angler (길건너 친구들 감성 3D 낚시 게임)

[![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?style=for-the-badge&logo=github)](https://jeiel85.github.io/crossy-fish/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"길건너 친구들" 특유의 아기자기한 3D 복셀 아트 감성으로 즐기는 100% 리얼 손맛 낚시 게임!**  
> 장애물 피하기는 그만! 평화로운 호숫가, 트로피컬 산호초, 얼어붙은 북극 빙하, 화산 칼데라, 2077 사이버 운하에서 찌를 던지고, 입질을 느끼며, 릴을 감아올리는 짜릿한 낚시를 즐겨보세요!

🎮 **[라이브 데모 플레이하기 (Live Demo)](https://jeiel85.github.io/crossy-fish/)**

---

## ✨ 주요 특징 (Key Features)

1. **🎲 Three.js 기반 3D 복셀 아트 & 아이소메트릭 낚시터**
   - 귀여운 복셀 강태공 캐릭터, 낚싯대, 찌, 유영하는 3D 물고기, 선착장과 수목 디오라마
   - 직교 카메라(Orthographic Camera)를 통한 아늑하고 감각적인 시점

2. **🎯 타겟팅 캐스팅 & 유영 물고기 탐색**
   - 물속에서 꼬리를 흔들며 헤엄치는 실제 3D 물고기들과 수면 파문(Ripples) 관찰
   - 물 위 원하는 곳을 마우스 클릭 / 터치하거나 `CAST` 버튼으로 정밀하게 찌 투척

3. **⚡ 짜릿한 챔질(Strike)과 텐션 릴링(Reeling) 손맛**
   - 찌가 쑥 들어가며 **`!` 경고** 발생 시 즉시 챔질!
   - 릴을 누르고 있으면 줄이 감기고, 떼면 풀리는 **줄 텐션 미니게임**
   - 물고기의 저항에 맞춰 텐션을 **초록색 적정 구간(Sweet Spot)**에 유지하여 인양 진행도 100% 달성 시 물고기 포획!
   - 모바일 기기 완벽 진동 햅틱 피드백 지원 (`navigator.vibrate`)

4. **🗺️ 5가지 환상적인 낚시터 스테이지**
   - **STAGE 1: 평화로운 에메랄드 호수 (Emerald Lake)** 🌲: 피라미, 붕어, 무지개 송어, 대왕 황금 잉어
   - **STAGE 2: 트로피컬 산호초 라군 (Tropical Lagoon)** 🏝️: 흰동가리, 블루탱, 만타 가오리, 전설의 청새치
   - **STAGE 3: 북극 빙하 얼음 낚시 (Glacier Ice Fishing)** ❄️: 빙어, 북극 곤들매기, 대왕 킹크랩, 빙하 수호 고래
   - **STAGE 4: 화산 칼데라 용암 낚시 (Magma Caldera)** 🌋: 불 피라미, 용암 메기, 흑요석 아귀, 불사조 용어
   - **STAGE 5: 사이버 2077 네온 운하 (Cyber Neon Canal)** 🏙️: 글리치 테트라, 홀로그램 농어, 사이버 샤크, 2077 메가 네온 웨일
   - 상단의 ◀ ▶ 버튼으로 언제든지 자유롭게 낚시터 이동 가능!

5. **📖 어종 도감 (Fishdex) & 대어 기록 시스템**
   - 총 20종의 물고기 수집 현황 및 도감 카드 확인
   - 어획 시 실제 길이(cm)와 무게(kg)가 측정되며 개인 최대 크기(Max Size) 신기록 갱신 지원

6. **🌤️ 8가지 다채로운 날씨 & 환경 시스템 (Dynamic Weather)**
   - **☀️ 쾌청한 맑음 (Sunny)**: 따스한 햇살과 맑은 수면
   - **🌧️ 보슬비 (Drizzle)**: 잔잔한 빗줄기와 잔물결 파문, **입질 속도 +15% 버프**
   - **⛈️ 폭풍우 & 번개 (Thunderstorm)**: 거센 폭우와 번개 섬광, 천둥소리, **입질 +40% 및 대어 확률 대폭 UP!**
   - **❄️ 함박눈 (Fluffy Snow)**: 나풀나풀 흩날리는 3D 눈송이와 겨울 정취
   - **🌫️ 짙은 해무 (Dense Mist)**: 신비로운 볼류메트릭 몽환 안개
   - **🌅 황혼 노을 (Golden Sunset)**: 붉은 노을빛과 신스웨이브 수면 반사
   - **🌌 은하수 밤하늘 (Starlit Night)**: 어두운 밤하늘과 별빛, 따뜻한 랜턴 조명, 야행성 발광 어종
   - **🌸 벚꽃비 (Cherry Blossom Breeze)**: 봄바람에 살랑이며 수면 위로 떨어지는 핑크빛 벚꽃잎

7. **🎥 4가지 시점 변경 기능 (Multi-Camera Perspectives)**
   - **📐 클래식 아이소메트릭 (Classic Isometric)**: 원작 길건너 친구들 특유의 감각적인 직교 뷰
   - **🎬 3인칭 숄더뷰 (Over-The-Shoulder)**: 강태공 등 뒤에서 넓은 수평선을 바라보는 콘솔급 몰입 뷰
   - **🔍 찌 집중 클로즈업 (Focus View)**: 물가와 찌에 바짝 다가가 물고기 입질을 초근접 관찰하는 스릴 뷰
   - **🦅 탑다운 조감뷰 (Top-Down Scouting)**: 하늘 위에서 낚시터 전체 물고기 그림자를 한눈에 탐색하는 조감 뷰
   - 단축키 `V` 또는 `C` 키 / 상단 `🎥 시점` 버튼으로 자유롭게 즉시 전환!

8. **🤖 스마트 AI 자동 낚시 모드 (Auto-Fishing)**
   - 상단 `🤖 AUTO` 버튼 클릭 시 인공지능이 스스로 물고기를 찾아 찌를 던지고, 입질 시 챔질하며, 텐션을 완벽하게 유지하여 낚시를 진행하는 방치형/아쿠아리움 감상 모드 지원

9. **🏆 서버리스 글로벌 온라인 랭킹 (Online Leaderboard)**
   - Dreamlo REST API 기반 서버리스 글로벌 랭킹 실시간 집계
   - 로컬 스토리지 이중 백업으로 오프라인에서도 기록 안전 보존

---

## 🎮 조작법 (Controls)

| 동작 | 데스크톱 키보드 / 마우스 | 모바일 / 터치 |
| :--- | :--- | :--- |
| **방향 이동** | `W / A / S / D` 또는 `방향키` | 화면 상하좌우 스와이프 / D-Pad |
| **시점 전환** | `V` 또는 `C` 키 / 상단 `🎥` 버튼 | 상단 `🎥` 버튼 터치 |
| **타겟 찌 던지기** | 물 위 원하는 지점 마우스 클릭 | 물 위 원하는 지점 화면 터치 |
| **기본 캐스팅** | `Spacebar` 또는 `CAST` 버튼 | 우측 하단 `CAST` 버튼 탭 |
| **챔질 (Strike)** | `!` 입질 시 `Spacebar` / 클릭 | `!` 입질 시 `STRIKE` 버튼 탭 |
| **릴 감기 (Reel)** | `Spacebar` 또는 `REEL` 버튼 누르고 있기 | `REEL` 버튼 누르고 있기 |
| **낚시터 변경** | 상단 `◀`, `▶` 버튼 또는 `[` , `]` 키 | 상단 `◀`, `▶` 버튼 터치 |
| **자동 낚시 봇** | 상단 `🤖 AUTO` 버튼 또는 `B` 키 | 상단 `🤖 AUTO` 버튼 터치 |

---

## 🛠️ 기술 스택 (Tech Stack)

- **3D Engine**: Three.js (r185)
- **Bundler & Tooling**: Vite 8.x
- **Visual FX**: Canvas-Confetti, Three.js Particle Weather Systems
- **Audio Engine**: Synthesized Web Audio API (외부 에셋 없이 0초 로딩)
- **Leaderboard**: Serverless Dreamlo REST API + Web LocalStorage
- **Deployment**: GitHub Actions (`deploy.yml`) -> GitHub Pages

---

## 🚀 로컬 실행 방법 (Local Development)

```bash
# 1. 저장소 클론
git clone https://github.com/jeiel85/crossy-fish.git
cd crossy-fish

# 2. 의존성 설치
npm install

# 3. 로컬 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

---

## 📄 라이선스 (License)

This project is licensed under the MIT License.
