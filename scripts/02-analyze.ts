import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function analyzeContent() {
  // 크롤링 데이터 로드
  const dataPath = path.join(
    process.cwd(),
    "data",
    "crawled",
    "crawled-data.json"
  );

  if (!fs.existsSync(dataPath)) {
    console.error("❌ 크롤링 데이터가 없습니다. 먼저 npm run geo:crawl 을 실행하세요.");
    process.exit(1);
  }

  const crawledData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // 콘텐츠 요약 (토큰 제한 고려)
  const contentSummary = crawledData
    .map(
      (page: any) =>
        `페이지: ${page.title}\nURL: ${page.url}\n내용 요약: ${page.content.substring(0, 500)}`
    )
    .join("\n\n---\n\n");

  console.log("🤖 Claude AI 분석 시작...");

  const structureResponse = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `당신은 GEO(Generative Engine Optimization) 전문가입니다.

다음은 기존 홈페이지에서 크롤링한 콘텐츠입니다:

${contentSummary}

위 콘텐츠를 분석하여 GEO 최적화된 Hub/Leaf 구조를 설계해주세요.

반드시 다음 JSON 형식으로만 출력해주세요 (다른 텍스트 없이):

{
  "business_summary": "비즈니스 한줄 요약",
  "target_keywords": ["핵심 키워드 5-10개"],
  "hubs": [
    {
      "title": "Hub 페이지 제목",
      "slug": "url-slug",
      "description": "Hub 설명",
      "leaves": [
        {
          "title": "Leaf 페이지 제목",
          "slug": "url-slug",
          "target_query": "타겟 검색 질의",
          "search_intent": "정보형"
        }
      ]
    }
  ],
  "faq_topics": ["FAQ 주제 30개"],
  "case_study_ideas": ["사례 연구 아이디어 5개"]
}

규칙:
- Hub는 2-3개
- 각 Hub 아래 Leaf는 10-20개
- Leaf는 실제 사용자가 AI에게 질문할 법한 내용
- FAQ는 30개 이상
- slug는 영문 소문자, 하이픈 사용
- 한국어 콘텐츠 기준
- JSON만 출력 (마크다운 코드블록 없이)`,
      },
    ],
  });

  const structureText =
    structureResponse.content[0].type === "text"
      ? structureResponse.content[0].text
      : "";

  // JSON 추출
  const jsonMatch = structureText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("❌ JSON 파싱 실패. AI 응답:");
    console.error(structureText);
    process.exit(1);
  }

  const siteStructure = JSON.parse(jsonMatch[0]);

  // 구조 저장
  const outputDir = path.join(process.cwd(), "data", "structure");
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "site-structure.json"),
    JSON.stringify(siteStructure, null, 2),
    "utf-8"
  );

  console.log("✅ 사이트 구조 설계 완료");
  console.log(`📊 비즈니스: ${siteStructure.business_summary}`);
  console.log(`📊 Hub ${siteStructure.hubs.length}개`);

  const totalLeaves = siteStructure.hubs.reduce(
    (sum: number, hub: any) => sum + hub.leaves.length,
    0
  );
  console.log(`📄 Leaf ${totalLeaves}개`);
  console.log(`❓ FAQ ${siteStructure.faq_topics.length}개`);

  return siteStructure;
}

analyzeContent().catch(console.error);
