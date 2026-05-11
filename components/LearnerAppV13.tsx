"use client";

import LearnerAppV12 from "@/components/LearnerAppV12";

function ChaBioBrandBadge() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-8 z-50 w-full max-w-[430px] -translate-x-1/2 px-8">
      <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md">
        <img
          src="/cha-biogroup-ci.png"
          alt="차바이오그룹 CI"
          className="h-8 w-auto shrink-0 object-contain"
        />
        <div className="min-w-0 leading-tight">
          <div className="text-[11px] font-extrabold text-slate-800">차바이오그룹 리더십 교육용</div>
          <div className="text-[10px] font-semibold text-slate-500">CHA Bio Group Decision Journey</div>
        </div>
      </div>
    </div>
  );
}

export default function LearnerAppV13() {
  return (
    <div className="relative">
      <ChaBioBrandBadge />
      <LearnerAppV12 />
    </div>
  );
}
