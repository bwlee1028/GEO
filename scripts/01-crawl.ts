import FirecrawlApp from "@mendable/firecrawl-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

async function crawlSite() {
  const targetUrl = process.env.TARGET_URL!;

  if (!targetUrl || targetUrl === "https://your-existing-site.com") {
    console.error("❌ .env.local 파일에서 TARGET_URL을 설정해주세요.");
    process.exit(1);
  }

  console.log(`🔍 크롤링 시작: ${targetUrl}`);

  // 사이트 크롤링 (최대 50페이지)
  const crawlResult = await firecrawl.crawlUrl(targetUrl, {
    limit: 50,
    scrapeOptions: {
      formats: ["markdown", "html"],
    },
  });

  if (!crawlResult.success) {
    throw new Error(`크롤링 실패: ${crawlResult.error}`);
  }

  // 크롤링 결과 저장
  const outputDir = path.join(process.cwd(), "data", "crawled");
  fs.mkdirSync(outputDir, { recursive: true });

  const pages: Array<{ url: string; title: string; content: string }> = [];

  for (const page of crawlResult.data) {
    pages.push({
      url: page.metadata?.sourceURL || "",
      title: page.metadata?.title || "",
      content: page.markdown || "",
    });
  }

  // JSON으로 저장
  fs.writeFileSync(
    path.join(outputDir, "crawled-data.json"),
    JSON.stringify(pages, null, 2),
    "utf-8"
  );

  // 전체 콘텐츠를 하나의 마크다운으로도 저장
  const allContent = pages
    .map((p) => `# ${p.title}\nURL: ${p.url}\n\n${p.content}`)
    .join("\n\n---\n\n");

  fs.writeFileSync(
    path.join(outputDir, "all-content.md"),
    allContent,
    "utf-8"
  );

  console.log(`✅ ${pages.length}개 페이지 크롤링 완료`);
  console.log(`📁 저장 위치: ${outputDir}`);

  return pages;
}

crawlSite().catch(console.error);
