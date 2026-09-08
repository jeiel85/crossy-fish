# 🎣 Crossy Fish (길건너 친구들 3D 낚시 게임)

[![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?style=for-the-badge&logo=github)](https://jeiel85.github.io/crossy-fish/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"길건너 친구들"의 경쾌한 점프 아케이드와 "낚시"의 손맛이 만났다!**  
> Three.js로 구현된 복셀(Voxel) 3D 세계에서 물살을 건너고, 방해물을 피하며, 각 스테이지의 전설적인 물고기들을 낚아보세요!

🎮 **[라이브 데모 플레이하기 (Live Demo)](https://jeiel85.github.io/crossy-fish/)**

---

## ✨ 주요 특징 (Key Features)

1. **🎲 Three.js 기반 3D 복셀 아트 & 아이소메트릭 뷰**
   - 귀여운 강태공 캐릭터, 낚싯대, 찌, 물고기, 통나무, 연꽃잎, 쾌속선 등 풀 복셀 3D 모델링
   - 부드러운 포물선 점프 애니메이션 및 착지 스쿼시 & 스트레치 효과
   - PCF 소프트 섀도우 및 ACES Filmic 톤 매핑을 통한 고품질 비주얼

2. **🌊 5가지 다채로운 스테이지 & 바이옴 (Biomes)**
   - **STAGE 1: 에메랄드 시냇가 (Emerald Creek)** 🌲: 피라미, 붕어, 무지개 송어, 황금 잉어
   - **STAGE 2: 트로피컬 산호초 (Tropical Reef)** 🏝️: 흰동가리, 블루탱, 청새치, 황금 가오리
   - **STAGE 3: 빙하 설원 (Frozen Glacier)** ❄️: 빙어, 북극 송어, 대왕 킹크랩, 빙하 수호 고래
   - **STAGE 4: 마그마 협곡 (Magma Inferno)** 🌋: 불 피라미, 용암 메기, 흑요석 아귀, 불사조 용어
   - **STAGE 5: 사이버 2077 네온 (Cyber River)** 🏙️: 글리치 테트라, 홀로그램 농어, 사이버 샤크, 2077 메가 네온 웨일

3. **🎣 신개념 낚시 메커니즘**
   - 물가나 통나무 위에서 찌를 던져 낚시를 진행합니다.
   - 느낌표(`!`)와 함께 입질이 오면 게이지가 줄어들기 전에 낚아채어 물고기를 수집하세요.
   - 희귀/전설 물고기를 낚으면 화려한 축하 폭죽과 함께 폭발적인 추가 점수를 획득합니다!

4. **🌤️ 실시간 날씨 & 낮/밤 사이클 (Dynamic Weather)**
   - **맑음 (Sunny)**: 따사로운 햇살과 맑은 수면
   - **비 & 천둥 (Rain)**: 3D 빗줄기 파티클, 수면 파문, 번개 섬광 및 천둥 음향
   - **눈 (Snow)**: 바람에 흩날리는 3D 눈송이 파티클과 차가운 색감
   - **안개 (Misty Fog)**: 몽환적인 볼륨 안개
   - **낮 / 밤 (Day & Night)**: 밤이 되면 어두운 밤하늘과 함께 낚싯대에 따뜻한 랜턴 조명이 켜집니다.

5. **🤖 스마트 AI 자동 플레이 (Auto-Play Bot)**
   - 원클릭으로 켜고 끌 수 있는 인공지능 봇 모드 (`🤖 BOT: ON/OFF` or `B` 키)
   - 전방 타일의 안전성, 움직이는 통나무의 착지 시점, 쾌속선의 충돌 경로를 예측하여 스스로 이동하고 낚시를 즐깁니다.

6. **🏆 서버리스 글로벌 온라인 랭킹 (Online Leaderboard)**
   - 서버 구축 없이 Dreamlo REST API 기반으로 전 세계 플레이어의 점수를 실시간 집계합니다.
   - 로컬 스토리지 자동 백업으로 오프라인 환경에서도 안전하게 기록이 보존됩니다.

7. **📱 모바일 완벽 지원 & 반응형 뷰**
   - 상/하/좌/우 화면 스와이프 제스처 이동
   - 직관적인 화면 D-Pad 및 대형 🎣 CAST 액션 버튼
   - 입질 및 조작 시 모바일 진동 햅틱 피드백 (`navigator.vibrate`)
   - 아이폰/안드로이드 Safe Area 완벽 대응

8. **🎵 100% Web Audio 신디사이저 사운드**
   - 외부 음원 파일 다운로드 없이 브라우저 오디오 신디사이저로 구현된 경쾌한 8비트 레트로 사운드 (점프, 입질, 낚기 팡파르, 낙수, 천둥 등)

---

## 🎮 조작법 (Controls)

| 동작 | 데스크톱 키보드 | 모바일 / 터치 |
| :--- | :--- | :--- |
| **전진 / 점프** | `W` 또는 `↑` | 화면 위로 스와이프 / 탭 / D-Pad ▲ |
| **좌측 이동** | `A` 또는 `←` | 화면 좌측 스와이프 / D-Pad ◀ |
| **우측 이동** | `D` 또는 `→` | 화면 우측 스와이프 / D-Pad ▶ |
| **후진** | `S` 또는 `↓` | 화면 아래로 스와이프 / D-Pad ▼ |
| **낚시 던지기 / 낚기** | `Spacebar` | 화면 우측 하단 `🎣 CAST` 버튼 |
| **AI 봇 토글** | `B` 키 | 상단 `🤖 BOT` 버튼 |

> ⚠️ **주의**: 한 자리에 너무 오래 머물거나 낚시만 하고 있으면 거대한 독수리(Eagle)가 날아와 낚아채 갑니다!

---

## 🛠️ 기술 스택 (Tech Stack)

- **3D Engine**: Three.js (r185)
- **Bundler & Tooling**: Vite 8.x
- **Particle & FX**: Canvas-Confetti, Three.js BufferGeometry Particle Systems
- **Sound Engine**: Web Audio API Procedural Synthesizer
- **Leaderboard**: Serverless Dreamlo REST API + Web LocalStorage
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) -> GitHub Pages

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
