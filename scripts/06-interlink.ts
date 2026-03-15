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

interface PageInfo {
  filePath: string;
  title: string;
  slug: string;
  hub?: string;
}

async function addInternalLinks() {
  const guideDir = path.join(process.cwd(), "content", "guide");

  if (!fs.existsSync(guideDir)) {
    console.error("❌ 가이드 콘텐츠가 없습니다.");
    process.exit(1);
  }

  // 모든 페이지 목록 수집
  const allPages: PageInfo[] = [];

  function collectPages(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        collectPages(fullPath);
      } else if (item.endsWith(".md")) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(fileContent);
        allPages.push({
          filePath: fullPath,
          title: data.title || item.replace(".md", ""),
          slug: data.slug || item.replace(".md", ""),
          hub: data.hub,
        });
      }
    }
  }

  collectPages(guideDir);

  const pageMap = allPages
    .map((p) => {
      const url = p.hub
        ? `/guide/${p.hub}/${p.slug}`
        : `/guide/${p.slug}`;
      return `${p.title}: ${url}`;
    })
    .join("\n");

  console.log(`🔗 내부 링크 추가 시작... (${allPages.length}개 페이지)\n`);

  let updated = 0;

  for (const page of allPages) {
    await delay(1500);

    const fileContent = fs.readFileSync(page.filePath, "utf-8");
    const { data, content } = matter(fileContent);

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `다음 콘텐츠에 관련 내부 링크를 자연스럽게 추가해주세요.

사용 가능한 페이지 목록:
${pageMap}

현재 페이지: ${page.title}

콘텐츠:
${content}

규칙:
- 자연스러운 앵커 텍스트 사용
- 페이지당 3-5개 내부 링크만 추가
- Markdown 링크 형식: [텍스트](URL)
- 콘텐츠 원문은 최대한 유지하되, 적절한 위치에 링크만 추가
- 자기 자신 페이지로의 링크는 제외
- frontmatter는 포함하지 말고 본문만 출력`,
          },
        ],
      });

      const updatedContent =
        response.content[0].type === "text" ? response.content[0].text : content;

      // frontmatter 재조합 + 업데이트된 콘텐츠
      const frontmatter = Object.entries(data)
        .map(([key, value]) => `${key}: "${value}"`)
        .join("\n");

      const finalContent = `---\n${frontmatter}\n---\n\n${updatedContent}`;

      fs.writeFileSync(page.filePath, finalContent, "utf-8");
      console.log(`  ✅ ${page.title}`);
      updated++;
    } catch (err) {
      console.error(`  ❌ ${page.title}`, err);
    }
  }

  console.log(`\n🎉 ${updated}개 페이지에 내부 링크 추가 완료`);
}

addInternalLinks().catch(console.error);
