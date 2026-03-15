import { getContentBySlug } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ)",
  description: "가장 많이 묻는 질문과 전문가 답변을 확인하세요",
};

export default async function FAQPage() {
  const faq = await getContentBySlug("faq", "index");

  // FAQPage JSON-LD (GEO 핵심!)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">❓ 자주 묻는 질문</h1>

        {faq ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: faq.content }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">아직 FAQ가 생성되지 않았습니다.</p>
            <code className="bg-gray-100 px-3 py-1 rounded">npm run geo:faq</code>
            <p className="mt-2">명령어를 실행하여 FAQ를 생성하세요.</p>
          </div>
        )}
      </main>
    </>
  );
}
