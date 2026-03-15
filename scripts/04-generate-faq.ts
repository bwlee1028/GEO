import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function generateFAQ() {
  const structurePath = path.join(
    process.cwd(),
    "data",
    "structure",
    "site-structure.json"
  );

  if (!fs.existsSync(structurePath)) {
    console.error("❌ 구조 데이터가 없습니다. 먼저 npm run geo:analyze 를 실행하세요.");
    process.exit(1);
  }

  const structure = JSON.parse(fs.readFileSync(structurePath, "utf-8"));

  console.log("🤖 FAQ 생성 시작...");

  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `비즈니스: ${structure.business_summary}

FAQ 주제 목록:
${structure.faq_topics.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

위 주제들에 대해 FAQ 콘텐츠를 생성해주세요.

출력 형식 (Markdown, frontmatter 포함):

---
title: "자주 묻는 질문"
description: "가장 많이 묻는 질문과 전문가 답변"
schema_type: "FAQPage"
---

# 자주 묻는 질문

각 질문에 대해:

## Q: [질문]

[2-4문장의 명확한 답변. AI가 직접 인용할 수 있을 만큼 구체적이고 명확하게.]

---

규칙:
- 각 답변은 AI가 직접 인용할 수 있을 만큼 명확하게
- 구체적 수치나 예시 포함
- 한국어로 작성
- 모든 주제에 대해 작성 (최소 30개)`,
      },
    ],
  });

  const faqContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  const faqDir = path.join(process.cwd(), "content", "faq");
  fs.mkdirSync(faqDir, { recursive: true });
  fs.writeFileSync(path.join(faqDir, "index.md"), faqContent, "utf-8");

  console.log("✅ FAQ 생성 완료");
  console.log(`📁 저장: content/faq/index.md`);
}

generateFAQ().catch(console.error);
