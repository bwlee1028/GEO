import Link from "next/link";
import { getAllContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 가이드",
  description: "모든 가이드 목록을 확인하세요",
};

export default function GuideListPage() {
  const guides = getAllContent("guide");
  const hubs = guides.filter((g) => g.type === "hub");

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">📚 전체 가이드</h1>

      {hubs.map((hub) => {
        const hubLeaves = guides.filter((g) => g.hub === hub.slug);
        return (
          <section key={hub.slug} className="mb-12">
            <Link href={`/guide/${hub.slug}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-600 hover:underline">
                {hub.title}
              </h2>
            </Link>
            <p className="text-gray-600 mb-4">{hub.description}</p>
            <div className="grid gap-3 pl-4 border-l-4 border-blue-200">
              {hubLeaves.map((leaf) => (
                <Link
                  key={leaf.slug}
                  href={`/guide/${leaf.slug}`}
                  className="block p-3 hover:bg-gray-50 rounded transition"
                >
                  <span className="font-medium text-gray-900">{leaf.title}</span>
                  {leaf.description && (
                    <p className="text-sm text-gray-500 mt-1">{leaf.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
