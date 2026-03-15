import { execSync } from "child_process";

const banner = `
╔══════════════════════════════════════════════════════╗
║          🌐 GEO 사이트 자동 생성기 v1.0             ║
║          Claude AI + Firecrawl + Next.js             ║
╚══════════════════════════════════════════════════════╝
`;

console.log(banner);

const steps = [
  {
    name: "1단계: 사이트 크롤링",
    script: "01-crawl.ts",
    description: "기존 홈페이지의 콘텐츠를 자동 수집합니다",
    required: true,
  },
  {
    name: "2단계: AI 구조 분석",
    script: "02-analyze.ts",
    description: "Claude AI가 최적의 Hub/Leaf 구조를 설계합니다",
    required: true,
  },
  {
    name: "3단계: 콘텐츠 생성",
    script: "03-generate-content.ts",
    description: "각 페이지의 GEO 최적화 콘텐츠를 생성합니다",
    required: true,
  },
  {
    name: "4단계: FAQ 생성",
    script: "04-generate-faq.ts",
    description: "30개 이상의 FAQ를 자동 생성합니다",
    required: true,
  },
  {
    name: "5단계: 품질 검증",
    script: "05-validate.ts",
    description: "생성된 콘텐츠의 GEO 품질을 검증합니다",
    required: false,
  },
  {
    name: "6단계: 내부 링크 추가",
    script: "06-interlink.ts",
    description: "페이지 간 내부 링크를 자동 삽입합니다",
    required: false,
  },
];

let completed = 0;
let failed = 0;
const startTime = Date.now();

for (const step of steps) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`📌 ${step.name}`);
  console.log(`   ${step.description}`);
  console.log(`${"═".repeat(60)}`);

  try {
    execSync(`npx tsx scripts/${step.script}`, {
      stdio: "inherit",
      env: { ...process.env },
    });
    completed++;
    console.log(`\n✅ ${step.name} 완료`);
  } catch (error) {
    failed++;
    if (step.required) {
      console.error(`\n❌ ${step.name} 실패 (필수 단계)`);
      console.error(`   이전 단계가 완료되었는지 확인하세요.`);
      process.exit(1);
    } else {
      console.warn(`\n⚠️  ${step.name} 실패 (선택 단계) - 건너뜁니다.`);
    }
  }
}

const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

console.log(`
╔══════════════════════════════════════════════════════╗
║              🎉 GEO 사이트 생성 완료!                ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║   ✅ 완료: ${String(completed).padEnd(2)}단계                                  ║
${failed > 0 ? `║   ⚠️  실패: ${String(failed).padEnd(2)}단계                                  ║\n` : ""}║   ⏱  소요: ${String(elapsedMinutes).padEnd(5)}분                               ║
║                                                      ║
║   👉 다음 단계:                                      ║
║      1. npm run dev       (로컬에서 확인)            ║
║      2. npm run build     (빌드 테스트)              ║
║      3. git push          (Vercel 자동 배포)         ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);
