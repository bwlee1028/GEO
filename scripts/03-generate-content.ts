import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// API 호출 간 딜레이 (Rate Limit 방지)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateLeafContent(
  hub: any,
  leaf: any,
  businessSummary: string
) {
  const today = new Date().toISOString().split("T")[0];

  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `당신은 GEO 콘텐츠 전문 작성자입니다.

비즈니스: ${businessSummary}
Hub 주제: ${hub.title}
Leaf 주제: ${leaf.title}
타겟 질의: ${leaf.target_query}
검색 의도: ${leaf.search_intent}

위 정보를 바탕으로 GEO 최적화 콘텐츠를 작성해주세요.

출력 형식 (Markdown, frontmatter 포함):

---
title: "${leaf.title}"
description: "메타 설명 (160자 이내)"
hub: "${hub.slug}"
slug: "${leaf.slug}"
target_query: "${leaf.target_query}"
date: "${today}"
type: "leaf"
schema_type: "Article"
---

# ${leaf.title}

## 핵심 요약
(3줄 요약 - AI가 인용하기 좋은 형태)

## 상세 내용

### 문제/배경
(왜 이 주제가 중요한지)

### 원인/분석
(구체적 원인이나 분석)

### 해결 방법
(실용적 해결책 3-5개, 번호 목록)

### 비용/시간 가이드
(구체적 수치 포함)

## 자주 묻는 질문

### Q1: [질문]
A1: [답변]

### Q2: [질문]
A2: [답변]

### Q3: [질문]
A3: [답변]

## 관련 가이드
- [${hub.title}](/guide/${hub.slug})

규칙:
- 전문적이지만 이해하기 쉽게
- 구체적 수치와 예시 포함
- AI가 인용하기 좋은 명확한 문장
- 한국어로 작성
- 최소 1500자 이상`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function generateHubContent(hub: any, businessSummary: string) {
  const today = new Date().toISOString().split("T")[0];
  const leafLinks = hub.leaves
    .map(
      (leaf: any) =>
        `- [${leaf.title}](/guide/${hub.slug}/${leaf.slug})`
    )
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `당신은 GEO 콘텐츠 전문 작성자입니다.

비즈니스: ${businessSummary}
Hub 주제: ${hub.title}

하위 Leaf 페이지 목록:
${leafLinks}

위 정보를 바탕으로 Hub 페이지 콘텐츠를 작성해주세요.
Hub 페이지는 개요 + 하위 페이지로의 내부 링크가 핵심입니다.

출력 형식 (Markdown, frontmatter 포함):

---
title: "${hub.title}"
description: "${hub.description}"
slug: "${hub.slug}"
type: "hub"
date: "${today}"
schema_type: "CollectionPage"
---

# ${hub.title}

## 개요
(이 주제의 전체적인 설명, 3-5문장)

## 가이드 목록

${leafLinks}

## 핵심 포인트
(이 주제에서 가장 중요한 3가지)

규칙:
- 모든 Leaf 페이지에 대한 내부 링크 포함
- 포괄적이지만 간결하게
- 한국어로 작성`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function generateAllContent() {
  // 구조 데이터 로드
  const structurePath = path.join(
    process.cwd(),
    "data",
    "structure",
    "site-structure.json"
  );

  if (!fs.existsSync(structurePath)) {
    console.error(
      "❌ 구조 데이터가 없습니다. 먼저 npm run geo:analyze 를 실행하세요."
    );
    process.exit(1);
  }

  const structure = JSON.parse(fs.readFileSync(structurePath, "utf-8"));
  const contentDir = path.join(process.cwd(), "content");

  let totalGenerated = 0;
  let totalErrors = 0;

  // Hub별 콘텐츠 생성
  for (const hub of structure.hubs) {
    console.log(`\n📁 Hub: ${hub.title}`);

    try {
      // Hub 콘텐츠 생성
      const hubContent = await generateHubContent(
        hub,
        structure.business_summary
      );
      const hubDir = path.join(contentDir, "guide");
      fs.mkdirSync(hubDir, { recursive: true });
      fs.writeFileSync(
        path.join(hubDir, `${hub.slug}.md`),
        hubContent,
        "utf-8"
      );
      console.log(`  ✅ Hub 페이지 생성: ${hub.slug}`);
      totalGenerated++;
    } catch (err) {
      console.error(`  ❌ Hub 생성 실패: ${hub.slug}`, err);
      totalErrors++;
    }

    // Leaf 콘텐츠 생성
    for (const leaf of hub.leaves) {
      await delay(1500); // Rate limit 방지 (1.5초 간격)

      try {
        const leafContent = await generateLeafContent(
          hub,
          leaf,
          structure.business_summary
        );

        const leafDir = path.join(contentDir, "guide", hub.slug);
        fs.mkdirSync(leafDir, { recursive: true });
        fs.writeFileSync(
          path.join(leafDir, `${leaf.slug}.md`),
          leafContent,
          "utf-8"
        );

        console.log(`    📄 Leaf 생성: ${leaf.slug}`);
        totalGenerated++;
      } catch (err) {
        console.error(`    ❌ Leaf 생성 실패: ${leaf.slug}`, err);
        totalErrors++;
      }
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 총 ${totalGenerated}개 콘텐츠 생성 완료`);
  if (totalErrors > 0) {
    console.log(`⚠️  ${totalErrors}개 실패`);
  }
}

generateAllContent().catch(console.error);
