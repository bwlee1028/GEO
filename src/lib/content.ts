import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export interface ContentPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  rawContent: string;
  hub?: string;
  type?: string;
  date?: string;
  schema_type?: string;
  target_query?: string;
}

/**
 * 특정 디렉토리의 모든 마크다운 파일을 재귀적으로 읽기
 */
export function getAllContent(subDir: string): ContentPage[] {
  const dir = path.join(contentDirectory, subDir);

  if (!fs.existsSync(dir)) return [];

  const entries: ContentPage[] = [];

  function readDir(currentDir: string, basePath: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDir(fullPath, `${basePath}/${item}`);
      } else if (item.endsWith(".md")) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(fileContent);

        const slug = `${basePath}/${item.replace(".md", "")}`.replace(
          /^\//,
          ""
        );

        entries.push({
          slug,
          title: data.title || item.replace(".md", ""),
          description: data.description || "",
          content: "",
          rawContent: content,
          hub: data.hub,
          type: data.type,
          date: data.date,
          schema_type: data.schema_type,
          target_query: data.target_query,
        });
      }
    }
  }

  readDir(dir, "");
  return entries;
}

/**
 * 단일 콘텐츠 가져오기 + HTML 변환
 */
export async function getContentBySlug(
  subDir: string,
  slug: string
): Promise<ContentPage | null> {
  // slug.md 또는 slug/index.md 시도
  const possiblePaths = [
    path.join(contentDirectory, subDir, `${slug}.md`),
    path.join(contentDirectory, subDir, slug, "index.md"),
  ];

  let filePath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const processedContent = await remark().use(html).process(content);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    content: processedContent.toString(),
    rawContent: content,
    hub: data.hub,
    type: data.type,
    date: data.date,
    schema_type: data.schema_type,
    target_query: data.target_query,
  };
}

/**
 * 모든 가이드 슬러그 목록 (정적 경로 생성용)
 */
export function getAllGuideSlugs(): string[][] {
  const guides = getAllContent("guide");
  return guides.map((guide) => guide.slug.split("/"));
}
