"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

interface Step {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  message?: string;
}

const INITIAL_STEPS: Step[] = [
  { id: "crawl",    name: "1단계: 사이트 크롤링",   description: "기존 홈페이지 콘텐츠를 자동 수집합니다",          status: "pending" },
  { id: "analyze",  name: "2단계: AI 구조 분석",    description: "Claude AI가 최적의 Hub/Leaf 구조를 설계합니다",   status: "pending" },
  { id: "generate", name: "3단계: 콘텐츠 생성",     description: "각 페이지의 GEO 최적화 콘텐츠를 생성합니다",      status: "pending" },
  { id: "faq",      name: "4단계: FAQ 생성",        description: "30개 이상의 FAQ를 자동 생성합니다",               status: "pending" },
  { id: "validate", name: "5단계: 품질 검증",       description: "생성된 콘텐츠의 GEO 품질을 검증합니다",           status: "pending" },
  { id: "interlink",name: "6단계: 내부 링크 추가",  description: "페이지 간 내부 링크를 자동 삽입합니다",           status: "pending" },
];

const statusIcon: Record<StepStatus, string> = {
  pending: "⬜",
  running: "🔄",
  done:    "✅",
  error:   "❌",
  skipped: "⚠️",
};

const statusColor: Record<StepStatus, string> = {
  pending: "text-gray-400",
  running: "text-blue-600 font-semibold animate-pulse",
  done:    "text-green-600 font-semibold",
  error:   "text-red-600 font-semibold",
  skipped: "text-yellow-600",
};

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl]         = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone]   = useState(false);
  const [steps, setSteps]     = useState<Step[]>(INITIAL_STEPS);
  const [error, setError]     = useState("");
  const [log, setLog]         = useState<string[]>([]);

  const updateStep = (id: string, status: StepStatus, message?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, message } : s))
    );
  };

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, msg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      setError("올바른 URL을 입력해주세요. (예: https://example.com)");
      return;
    }

    setError("");
    setIsRunning(true);
    setIsDone(false);
    setSteps(INITIAL_STEPS);
    setLog([]);
    addLog(`🚀 GEO 자동 생성 시작: ${url}`);

    try {
      const res = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data:", "").trim());

            if (data.type === "step_start") {
              updateStep(data.step, "running");
              addLog(`▶ ${data.message}`);
            } else if (data.type === "step_done") {
              updateStep(data.step, "done", data.message);
              addLog(`✅ ${data.message}`);
            } else if (data.type === "step_error") {
              updateStep(data.step, "error", data.message);
              addLog(`❌ ${data.message}`);
            } else if (data.type === "step_skipped") {
              updateStep(data.step, "skipped", data.message);
              addLog(`⚠️ ${data.message}`);
            } else if (data.type === "log") {
              addLog(data.message);
            } else if (data.type === "done") {
              setIsDone(true);
              addLog("🎉 전체 완료!");
            } else if (data.type === "error") {
              setError(data.message);
              addLog(`❌ 오류: ${data.message}`);
            }
          } catch {
            // JSON 파싱 실패 무시
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  const completedCount = steps.filter((s) => s.status === "done").length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🌐 GEO 콘텐츠 자동 생성
        </h1>
        <p className="text-gray-500 text-lg">
          크롤링할 사이트 URL을 입력하면 AI가 자동으로 콘텐츠를 생성합니다
        </p>
      </div>

      {/* URL 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">
            🔗 크롤링할 사이트 URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isRunning}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-base
                         focus:outline-none focus:border-blue-500 transition
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isRunning || !url}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl
                         hover:bg-blue-700 transition disabled:opacity-50
                         disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isRunning ? "⏳ 생성 중..." : "🚀 생성 시작"}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
          )}
          <p className="text-gray-400 text-xs">
            예시: https://www.your-company.com
          </p>
        </div>
      </form>

      {/* 진행 상황 */}
      {(isRunning || isDone || steps.some((s) => s.status !== "pending")) && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">📊 진행 상황</h2>
            <span className="text-sm font-semibold text-blue-600">{progress}%</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 단계 목록 */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all
                  ${step.status === "running" ? "bg-blue-50 border border-blue-200" : ""}
                  ${step.status === "done"    ? "bg-green-50 border border-green-100" : ""}
                  ${step.status === "error"   ? "bg-red-50 border border-red-100" : ""}
                `}
              >
                <span className="text-xl mt-0.5">{statusIcon[step.status]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${statusColor[step.status]}`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {step.message || step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료 메시지 */}
      {isDone && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-700 mb-2">
            GEO 콘텐츠 생성 완료!
          </h3>
          <p className="text-green-600 mb-4">
            가이드와 FAQ가 성공적으로 생성되었습니다.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl
                       hover:bg-green-700 transition"
          >
            📚 결과 보러 가기
          </button>
        </div>
      )}

      {/* 로그 */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-mono mb-2">📋 실행 로그</p>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {log.map((line, i) => (
              <p key={i} className="text-green-400 text-xs font-mono">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
