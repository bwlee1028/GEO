import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GEO 최적화 가이드 센터",
    template: "%s | GEO 가이드 센터",
  },
  description: "AI 검색 최적화된 전문 가이드와 FAQ",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        {/* 네비게이션 */}
        <nav className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900">
              📘 가이드 센터
            </a>
            <div className="flex gap-6">
              <a href="/guide" className="text-gray-600 hover:text-gray-900">가이드</a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
              <a href="/case-study" className="text-gray-600 hover:text-gray-900">사례</a>
            </div>
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        {children}

        {/* 푸터 */}
        <footer className="border-t mt-16 py-8 text-center text-gray-500">
          <div className="max-w-6xl mx-auto px-4">
            <p>© 2025 GEO 가이드 센터. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
