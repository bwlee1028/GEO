import Link from "next/link";
import { getAllContent } from "@/lib/content";

export default function Home() {
  const guides = getAllContent("guide");
  const hubs = guides.filter((g) => g.type === "hub");
  const leaves = guides.filter((g) => g.type !== "hub");

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* 히어로 섹션 */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          전문 가이드 센터
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI 검색에 최적화된 전문적인 가이드와 FAQ를 통해
          궁금한 점을 빠르게 해결하세요.
        </p>
      </section>

      {/* 통계 */}
      <section className="grid grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{hubs.length}</div>
          <div className="text-gray-600">가이드 카테고리</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{leaves.length}</div>
          <div className="text-gray-600">상세 가이드</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">30+</div>
          <div className="text-gray-600">FAQ</div>
        </div>
      </section>

      {/* Hub 카드 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">📚 가이드 카테고리</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.length > 0 ? (
            hubs.map((hub) => (
              <Link
                key={hub.slug}
                href={`/guide/${hub.slug}`}
                className="block p-6 border-2 rounded-xl hover:shadow-lg hover:border-blue-500 transition-all duration-200"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {hub.title}
                </h3>
                <p className="text-gray-600 mb-4">{hub.description}</p>
                <span className="text-blue-600 font-medium">자세히 보기 →</span>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg mb-4">아직 생성된 가이드가 없습니다.</p>
              <code className="bg-gray-100 px-3 py-1 rounded">npm run geo:all</code>
              <p className="mt-2">명령어를 실행하여 콘텐츠를 생성하세요.</p>
            </div>
          )}
        </div>
      </section>

      {/* 빠른 링크 */}
      <section className="text-center">
        <div className="flex justify-center gap-4">
          <Link
            href="/faq"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ❓ 자주 묻는 질문
          </Link>
          <Link
            href="/case-study"
            className="px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-500 transition"
          >
            📋 성공 사례
          </Link>
        </div>
      </section>
    </main>
  );
}
