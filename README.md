# 🌐 GEO 사이트 자동 생성기

> **Claude AI + Firecrawl**을 활용하여 기존 홈페이지를 GEO(Generative Engine Optimization)에 최적화된 사이트로 자동 변환하는 도구

---

## 📋 목차

1. [사전 준비](#-사전-준비)
2. [로컬 설치](#-로컬-설치)
3. [API 키 발급](#-api-키-발급)
4. [실행 방법](#-실행-방법)
5. [프로젝트 구조](#-프로젝트-구조)
6. [스크립트 설명](#-스크립트-설명)
7. [배포](#-배포)
8. [예상 비용](#-예상-비용)
9. [문제 해결](#-문제-해결)

---

## 🛠 사전 준비

| 항목 | 버전 | 설치 링크 |
|------|------|-----------|
| Node.js | 18 이상 | https://nodejs.org/ |
| npm | 9 이상 | Node.js에 포함 |
| Git | 최신 | https://git-scm.com/ |

> ✅ 버전 확인: `node -v` / `npm -v` / `git --version`

---

## 🚀 로컬 설치

### 방법 1 — 자동 설치 스크립트 (권장)

```bash
# 1. GitHub에서 클론
git clone https://github.com/bwlee1028/GEO.git
cd GEO

# 2. 자동 설치 스크립트 실행 (패키지 설치 + 환경 변수 설정 안내)
bash setup.sh
```

### 방법 2 — 수동 설치

```bash
# 1. GitHub에서 클론
git clone https://github.com/bwlee1028/GEO.git
cd GEO

# 2. 패키지 설치
npm install

# 3. 환경 변수 파일 생성
cp .env.example .env.local

# 4. .env.local 파일을 편집기로 열어 API 키 입력
# (아래 'API 키 발급' 섹션 참고)
```

---

## 🔑 API 키 발급

`.env.local` 파일에 아래 3가지 값을 설정해야 합니다.

### 1. ANTHROPIC_API_KEY (Claude AI)

1. https://console.anthropic.com/ 접속
2. 회원가입 / 로그인
3. **API Keys** 메뉴 → **Create Key**
4. 생성된 키를 복사하여 `.env.local`에 붙여넣기

### 2. FIRECRAWL_API_KEY (크롤러)

1. https://www.firecrawl.dev/ 접속
2. 회원가입 / 로그인 (무료 500 크레딧 제공)
3. **Dashboard** → **API Keys** 메뉴에서 키 복사
4. `.env.local`에 붙여넣기

### 3. TARGET_URL (크롤링 대상)

```env
TARGET_URL=https://www.your-site.com
```

> 크롤링하고 싶은 **기존 홈페이지** URL을 입력하세요.

### ✏️ .env.local 설정 예시

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxxxxxx
TARGET_URL=https://www.example.com
```

---

## ▶️ 실행 방법

### 🔥 전체 자동 실행 (권장)

```bash
npm run geo:all
```

> 크롤링 → AI 분석 → 콘텐츠 생성 → FAQ 생성 → 검증 → 내부 링크까지 한 번에 실행됩니다.

---

### 📌 단계별 실행

| 순서 | 명령어 | 설명 | 소요 시간 |
|------|--------|------|-----------|
| 1 | `npm run geo:crawl` | 기존 사이트 크롤링 (최대 50페이지) | 1~3분 |
| 2 | `npm run geo:analyze` | Claude AI로 Hub/Leaf 구조 설계 | 1~2분 |
| 3 | `npm run geo:generate` | 각 페이지 GEO 콘텐츠 생성 | 5~15분 |
| 4 | `npm run geo:faq` | FAQ 30개 이상 자동 생성 | 2~5분 |
| 5 | `npm run geo:validate` | 콘텐츠 품질 검증 | 1~2분 |
| 6 | `npm run geo:interlink` | 내부 링크 자동 삽입 | 1분 |

---

### 🖥 로컬에서 결과 확인

```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 → **http://localhost:3000** 접속

---

### 🏗 빌드 테스트

```bash
npm run build
npm run start
```

---

## 📁 프로젝트 구조

```
GEO/
├── 📄 .env.example          ← 환경 변수 예시 파일
├── 📄 .env.local            ← 실제 환경 변수 (Git 제외, 직접 생성)
├── 📄 setup.sh              ← 자동 설치 스크립트
├── 📄 package.json
├── 📄 next.config.js
│
├── 📂 scripts/              ← 자동화 스크립트
│   ├── 01-crawl.ts          (크롤링)
│   ├── 02-analyze.ts        (AI 분석)
│   ├── 03-generate-content.ts (콘텐츠 생성)
│   ├── 04-generate-faq.ts   (FAQ 생성)
│   ├── 05-validate.ts       (품질 검증)
│   ├── 06-interlink.ts      (내부 링크)
│   └── run-all.ts           (전체 실행)
│
├── 📂 src/
│   ├── app/                 ← Next.js 페이지
│   │   ├── page.tsx         (메인 홈)
│   │   ├── guide/           (가이드 페이지)
│   │   ├── faq/             (FAQ 페이지)
│   │   └── case-study/      (사례 연구)
│   └── lib/
│       └── content.ts       (마크다운 유틸리티)
│
├── 📂 content/              ← 자동 생성된 Markdown (Git 추적)
│   ├── guide/
│   └── faq/
│
└── 📂 data/                 ← 크롤링/분석 데이터 (Git 제외)
    ├── crawled/
    └── structure/
```

---

## 📜 스크립트 설명

| 스크립트 | 입력 | 출력 |
|----------|------|------|
| `01-crawl.ts` | `TARGET_URL` | `data/crawled/crawled-data.json` |
| `02-analyze.ts` | `crawled-data.json` | `data/structure/site-structure.json` |
| `03-generate-content.ts` | `site-structure.json` | `content/guide/*.md` |
| `04-generate-faq.ts` | `site-structure.json` | `content/faq/index.md` |
| `05-validate.ts` | `content/**/*.md` | 콘솔 리포트 |
| `06-interlink.ts` | `content/**/*.md` | 내부 링크 추가된 md 파일 |

---

## 🚢 배포

### Vercel 자동 배포 (무료)

```bash
# 콘텐츠 생성 후 GitHub에 푸시하면 자동 배포
git add .
git commit -m "feat: GEO 콘텐츠 생성"
git push origin main
```

> Vercel과 GitHub 저장소를 연결하면 `git push` 만으로 자동 배포됩니다.

**Vercel 연결 방법:**
1. https://vercel.com 접속 → GitHub 로그인
2. **New Project** → `GEO` 저장소 선택
3. **Deploy** 클릭 → 완료!

---

## 💰 예상 비용

| 서비스 | 사용량 | 비용 |
|--------|--------|------|
| Claude API | 50페이지 생성 | ~$3~5 |
| Firecrawl | 무료 500 크레딧 | $0 |
| Vercel Hobby | 무료 플랜 | $0 |
| **총합** | | **~$5 이하** |

---

## 🔧 문제 해결

### ❌ `npm install` 실패
```bash
# Node.js 버전 확인 (18 이상 필요)
node -v

# npm 캐시 초기화 후 재시도
npm cache clean --force
npm install
```

### ❌ `크롤링 실패` 오류
- `.env.local`에 `FIRECRAWL_API_KEY`가 올바르게 설정되었는지 확인
- `TARGET_URL`이 실제 접속 가능한 URL인지 확인
- Firecrawl 대시보드에서 크레딧 잔량 확인

### ❌ `Claude AI 오류`
- `.env.local`에 `ANTHROPIC_API_KEY`가 올바르게 설정되었는지 확인
- Anthropic 콘솔에서 API 잔액 확인

### ❌ `npm run dev` 빌드 오류
```bash
# .next 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

---

## 📮 문의

- GitHub Issues: https://github.com/bwlee1028/GEO/issues
