import { getAllContent, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { slug: string[] };
}

// 정적 경로 생성 (빌드 시)
export async function generateStaticParams() {
  const allGuides = getAllContent("guide");
  return allGuides.map((guide) => ({
    slug: guide.slug.split("/"),
  }));
}

// 메타데이터 (SEO/GEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugPath = params.slug.join("/");
  const page = await getContentBySlug("guide", slugPath);

  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const slugPath = params.slug.join("/");
  const page = await getContentBySlug("guide", slugPath);

  if (!page) notFound();

  // 관련 페이지 찾기
  const allGuides = getAllContent("guide");
  const relatedPages = allGuides
    .filter((g) => g.hub === page.hub && g.slug !== page.slug)
    .slice(0, 5);

  // JSON-LD 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": page.schema_type || "Article",
    headline: page.title,
    description: page.description,
    datePublished: page.date,
    author: {
      "@type": "Organization",
      name: "GEO 가이드 센터",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* 메인 콘텐츠 */}
        <article className="flex-1 max-w-4xl">
          {/* 브레드크럼 */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">홈</Link>
            <span className="mx-2">/</span>
            <Link href="/guide" className="hover:text-gray-700">가이드</Link>
            {page.hub && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/guide/${page.hub}`} className="hover:text-gray-700">
                  {page.hub}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{page.title}</span>
          </nav>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              {page.title}
            </h1>
            {page.description && (
              <p className="text-xl text-gray-600">{page.description}</p>
            )}
            {page.date && (
              <time className="text-sm text-gray-400 mt-2 block">
                {page.date}
              </time>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>

        {/* 사이드바 - 관련 콘텐츠 */}
        {relatedPages.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">📌 관련 가이드</h3>
              <ul className="space-y-2">
                {relatedPages.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/guide/${related.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
