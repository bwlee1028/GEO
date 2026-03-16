import { NextRequest } from "next/server";
import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// SSE 이벤트 형식으로 데이터 전송
function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return new Response(sseEvent({ type: "error", message: "URL이 필요합니다." }), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      const cwd = process.cwd();

      // .env.local에 TARGET_URL 업데이트
      try {
        const envPath = path.join(cwd, ".env.local");
        let envContent = "";

        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, "utf-8");
          // TARGET_URL 교체 또는 추가
          if (envContent.includes("TARGET_URL=")) {
            envContent = envContent.replace(/TARGET_URL=.*/g, `TARGET_URL=${url}`);
          } else {
            envContent += `\nTARGET_URL=${url}`;
          }
        } else {
          envContent = `TARGET_URL=${url}\n`;
        }

        fs.writeFileSync(envPath, envContent, "utf-8");
        send({ type: "log", message: `✅ TARGET_URL 설정 완료: ${url}` });
      } catch (e: any) {
        send({ type: "error", message: `.env.local 업데이트 실패: ${e.message}` });
        controller.close();
        return;
      }

      // 실행할 스크립트 단계 정의
      const steps = [
        { id: "crawl",     script: "01-crawl.ts",            required: true,  name: "사이트 크롤링" },
        { id: "analyze",   script: "02-analyze.ts",           required: true,  name: "AI 구조 분석" },
        { id: "generate",  script: "03-generate-content.ts",  required: true,  name: "콘텐츠 생성" },
        { id: "faq",       script: "04-generate-faq.ts",      required: true,  name: "FAQ 생성" },
        { id: "validate",  script: "05-validate.ts",          required: false, name: "품질 검증" },
        { id: "interlink", script: "06-interlink.ts",         required: false, name: "내부 링크 추가" },
      ];

      for (const step of steps) {
        send({ type: "step_start", step: step.id, message: `${step.name} 시작 중...` });

        try {
          const output = execSync(`npx tsx scripts/${step.script}`, {
            cwd,
            env: { ...process.env },
            timeout: 300000, // 5분 타임아웃
            encoding: "utf-8",
          });

          // 출력 로그 전송
          const lines = output.split("\n").filter((l) => l.trim());
          for (const line of lines) {
            send({ type: "log", message: line });
          }

          send({ type: "step_done", step: step.id, message: `${step.name} 완료` });

        } catch (err: any) {
          const errMsg = err.stderr || err.stdout || err.message || "알 수 없는 오류";
          const lines = errMsg.split("\n").filter((l: string) => l.trim());
          for (const line of lines) {
            send({ type: "log", message: line });
          }

          if (step.required) {
            send({ type: "step_error", step: step.id, message: `${step.name} 실패 (필수 단계)` });
            send({ type: "error", message: `${step.name} 실패로 중단되었습니다. .env.local 설정을 확인해주세요.` });
            controller.close();
            return;
          } else {
            send({ type: "step_skipped", step: step.id, message: `${step.name} 건너뜀 (선택 단계)` });
          }
        }
      }

      send({ type: "done", message: "전체 완료" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
