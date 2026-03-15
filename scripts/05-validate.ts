import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import matter from "gray-matter";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ValidationResult {
  file: string;
  title: string;
  scores: {
    clarity: number;
    specificity: number;
    structure: number;
    credibility: number;
    completeness: number;
  };
  total: number;
  grade: string;
  improvements: string[];
}

async function validateContent(
  filePath: string,
  content: string,
  targetQuery: string
): Promise<ValidationResult | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `다음 콘텐츠가 "${targetQuery}" 질문에 대해 
AI가 인용하기 좋은 품질인지 평가해주세요.

콘텐츠:
${content.substring(0, 2000)}

평가 기준 (각 1-10점):
1. clarity (명확성): AI가 바로 인용할 수 있는가?
2. specificity (구체성): 수치/예시가 포함되어 있는가?
3. structure (구조): 헤딩/리스트가 잘 정리되어 있는가?
4. credibility (신뢰성): 전문적 근거가 있는가?
5. completeness (완전성): 질문에 충분히 답하는가?

반드시 다음 JSON 형식으로만 출력 (다른 텍스트 없이):
{
  "scores": { "clarity": 8, "specificity": 7, "structure": 8, "credibility": 7, "completeness": 8 },
  "total": 38,
  "grade": "A",
  "improvements": ["개선점1", "개선점2"]
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const result = JSON.parse(jsonMatch[0]);
    return {
      file: filePath,
      title: targetQuery,
      ...result,
    };
  } catch {
    return null;
  }
}

async function validateAll() {
  const guideDir = path.join(process.cwd(), "content", "guide");

  if (!fs.existsSync(guideDir)) {
    console.error("❌ 가이드 콘텐츠가 없습니다.");
    process.exit(1);
  }

  console.log("🔍 콘텐츠 품질 검증 시작...\n");

  const results: ValidationResult[] = [];

  function readDir(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        readDir(fullPath);
      } else if (item.endsWith(".md")) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(fileContent);
        if (data.target_query) {
          results.push({
            file: fullPath,
            title: data.title || item,
            scores: { clarity: 0, specificity: 0, structure: 0, credibility: 0, completeness: 0 },
            total: 0,
            grade: "",
            improvements: [],
          });
        }
      }
    }
  }

  readDir(guideDir);

  console.log(`📄 검증 대상: ${results.length}개 파일\n`);

  const validatedResults: ValidationResult[] = [];

  for (const item of results) {
    await delay(1500);
    const fileContent = fs.readFileSync(item.file, "utf-8");
    const { data, content } = matter(fileContent);

    const result = await validateContent(item.file, content, data.target_query);
    if (result) {
      validatedResults.push(result);
      const emoji = result.total >= 40 ? "🟢" : result.total >= 30 ? "🟡" : "🔴";
      console.log(
        `${emoji} ${result.title}: ${result.total}/50 (${result.grade})`
      );
    }
  }

  // 결과 저장
  const outputPath = path.join(process.cwd(), "data", "validation-report.json");
  fs.writeFileSync(outputPath, JSON.stringify(validatedResults, null, 2), "utf-8");

  // 요약
  const avg =
    validatedResults.reduce((sum, r) => sum + r.total, 0) /
    validatedResults.length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 평균 점수: ${avg.toFixed(1)}/50`);
  console.log(`📁 상세 리포트: ${outputPath}`);
}

validateAll().catch(console.error);
