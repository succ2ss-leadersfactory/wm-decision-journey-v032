import LearnerAppPilotV2 from "@/components/LearnerAppPilotV2";

export default function Page() {
  return (
    <main className="pilot-page flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 p-6">
      <style>{`
        .pilot-page .flex-1 div:has(> img[alt="차바이오그룹 CI"]) {
          display: none !important;
        }
      `}</style>
      <LearnerAppPilotV2 />
    </main>
  );
}
