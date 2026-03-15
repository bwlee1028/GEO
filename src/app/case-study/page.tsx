import Link from "next/link";
import { getAllContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "성공 사례",
  description: "실제 성공 사례를 확인하세요",
};

export default function CaseStudyPage() {
  const cases = getAllContent("case-study");

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">📋 성공 사례</h1>

      {cases.length > 0 ? (
        <div className="grid gap-6">
          {cases.map((item) => (
            <Link
              key={item.slug}
              href={`/case-study/${item.slug}`}
              className="block p-6 border rounded-lg hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>사례 콘텐츠가 곧 추가됩니다.</p>
        </div>
      )}
    </main>
  );
}
