#!/bin/bash

# =====================================================
# GEO 사이트 자동 생성기 - 로컬 설치 스크립트
# =====================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║          🌐 GEO 사이트 자동 생성기 Setup            ║${NC}"
echo -e "${CYAN}${BOLD}║          Claude AI + Firecrawl + Next.js             ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ──────────────────────────────────────────────────────
# 1. Node.js 버전 확인
# ──────────────────────────────────────────────────────
echo -e "${BLUE}[1/4] Node.js 버전 확인 중...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
  echo -e "    👉 https://nodejs.org/ 에서 Node.js 18 이상을 설치해주세요."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 18 이상이 필요합니다. 현재 버전: $(node -v)${NC}"
  echo -e "    👉 https://nodejs.org/ 에서 최신 LTS 버전을 설치해주세요."
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) 확인됨${NC}"

# ──────────────────────────────────────────────────────
# 2. npm 패키지 설치
# ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/4] npm 패키지 설치 중...${NC}"

npm install

echo -e "${GREEN}✅ 패키지 설치 완료${NC}"

# ──────────────────────────────────────────────────────
# 3. .env.local 설정
# ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/4] 환경 변수 설정 확인 중...${NC}"

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${YELLOW}⚠️  .env.local 파일이 생성되었습니다.${NC}"
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  반드시 .env.local 파일을 열고 아래 3가지를 설정하세요:${NC}"
  echo ""
  echo -e "  ${CYAN}ANTHROPIC_API_KEY${NC}  → https://console.anthropic.com/"
  echo -e "  ${CYAN}FIRECRAWL_API_KEY${NC}  → https://www.firecrawl.dev/"
  echo -e "  ${CYAN}TARGET_URL${NC}         → 크롤링할 사이트 URL"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # 대화형으로 API 키 입력 받기
  read -p "  지금 바로 API 키를 입력하시겠습니까? (y/n): " SETUP_NOW
  if [[ "$SETUP_NOW" == "y" || "$SETUP_NOW" == "Y" ]]; then
    echo ""
    read -p "  ANTHROPIC_API_KEY를 입력하세요: " ANTHROPIC_KEY
    read -p "  FIRECRAWL_API_KEY를 입력하세요: " FIRECRAWL_KEY
    read -p "  TARGET_URL을 입력하세요 (예: https://example.com): " TARGET

    # .env.local 업데이트
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s|your_anthropic_api_key_here|${ANTHROPIC_KEY}|g" .env.local
      sed -i '' "s|your_firecrawl_api_key_here|${FIRECRAWL_KEY}|g" .env.local
      sed -i '' "s|https://your-existing-site.com|${TARGET}|g" .env.local
    else
      # Linux
      sed -i "s|your_anthropic_api_key_here|${ANTHROPIC_KEY}|g" .env.local
      sed -i "s|your_firecrawl_api_key_here|${FIRECRAWL_KEY}|g" .env.local
      sed -i "s|https://your-existing-site.com|${TARGET}|g" .env.local
    fi

    echo -e "${GREEN}✅ .env.local 설정 완료${NC}"
  else
    echo -e "${YELLOW}  📝 나중에 .env.local 파일을 직접 수정해주세요.${NC}"
  fi
else
  echo -e "${GREEN}✅ .env.local 파일이 이미 존재합니다.${NC}"
fi

# ──────────────────────────────────────────────────────
# 4. 완료 안내
# ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/4] 설치 완료!${NC}"
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║                🎉 설치 완료!                        ║${NC}"
echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║                                                      ║${NC}"
echo -e "${GREEN}${BOLD}║  다음 명령어로 실행하세요:                           ║${NC}"
echo -e "${GREEN}${BOLD}║                                                      ║${NC}"
echo -e "${GREEN}${BOLD}║  👉 GEO 콘텐츠 자동 생성 (전체 실행):               ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run geo:all                                  ║${NC}"
echo -e "${GREEN}${BOLD}║                                                      ║${NC}"
echo -e "${GREEN}${BOLD}║  👉 로컬 개발 서버 시작:                             ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run dev                                      ║${NC}"
echo -e "${GREEN}${BOLD}║     → http://localhost:3000 에서 확인                ║${NC}"
echo -e "${GREEN}${BOLD}║                                                      ║${NC}"
echo -e "${GREEN}${BOLD}║  👉 단계별 실행:                                     ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run geo:crawl    (1. 크롤링)                 ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run geo:analyze  (2. AI 분석)                ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run geo:generate (3. 콘텐츠 생성)            ║${NC}"
echo -e "${GREEN}${BOLD}║     npm run geo:faq      (4. FAQ 생성)               ║${NC}"
echo -e "${GREEN}${BOLD}║                                                      ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
