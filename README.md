# 🌐 GEO 사이트 자동 생성기

Claude AI를 활용한 GEO(Generative Engine Optimization) 사이트 자동 생성 도구

## 🚀 빠른 시작

### 1. 패키지 설치
```bash
npm install
```

### 2. API 키 설정
`.env.local` 파일을 열고 다음 값을 설정하세요:
- `ANTHROPIC_API_KEY`: Claude AI API 키
- `FIRECRAWL_API_KEY`: Firecrawl API 키
- `TARGET_URL`: 크롤링할 기존 사이트 URL

### 3. 사이트 자동 생성
```bash
npm run geo:all
```

### 4. 로컬에서 확인
```bash
npm run dev
```

### 5. 배포
```bash
npm run build
# GitHub push 후 Vercel 자동 배포
```

## 📋 개별 스크립트

| 명령어 | 설명 |
|---------|------|
| `npm run geo:crawl` | 기존 사이트 크롤링 |
| `npm run geo:analyze` | AI 구조 분석 |
| `npm run geo:generate` | 콘텐츠 생성 |
| `npm run geo:faq` | FAQ 생성 |
| `npm run geo:validate` | 품질 검증 |
| `npm run geo:interlink` | 내부 링크 추가 |
| `npm run geo:all` | 전체 실행 |

## 📁 구조

```
content/          → 자동 생성된 Markdown 콘텐츠
data/             → 크롤링 데이터, 분석 결과
scripts/          → 자동화 스크립트
src/app/          → Next.js 페이지
src/lib/          → 유틸리티 함수
```

## 💰 예상 비용

- Claude API (50페이지): ~$3-5
- Firecrawl (무료 500 크레딧): $0
- Vercel (Hobby): $0
- **총 초기 비용: ~$5 이하**
