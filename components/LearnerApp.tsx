"use client";

import React, { useState } from "react";
import { rounds } from "@/lib/data";
import { saveSubmission } from "@/lib/storage";
import { Card, OptionCard, Pill, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const steps = ["입장", "상황", "1차", "돌발", "2차", "AI", "결정"];
const reviewItems = [
  "우리 조직의 맥락이 반영되었는가?",
  "팀원의 감정과 체면을 고려했는가?",
  "상사와 타부서의 기대를 놓치지 않았는가?",
  "실행 비용을 과소평가하지 않았는가?",
  "실제 팀장이 말할 수 있는 문장인가?",
];

function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${i <= activeIndex ? "bg-blue-600" : "bg-slate-200"}`} />
          {i < steps.length - 1 && <div className={`h-px w-5 ${i < activeIndex ? "bg-blue-300" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function MobileShell({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <div className="mx-auto flex min-h-[820px] w-full max-w-[420px] flex-col overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-50 shadow-2xl">
      <div className="flex items-center justify-between bg-white px-5 pb-2 pt-5">
        <div className="text-xs font-semibold text-slate-500">9:41</div>
        <div className="text-sm font-extrabold text-slate-800">업무관리 딜레마</div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-teal-100" />
      </div>
      <div className="bg-white px-4"><ProgressDots activeIndex={step} /></div>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      <div className="grid grid-cols-6 gap-1 border-t border-slate-100 bg-white px-3 py-3 text-center text-[10px] text-slate-400">
        {["입장", "상황", "1차", "돌발", "2차", "결정"].map((s, i) => (
          <div key={s} className={i === step ? "font-bold text-blue-600" : ""}>●<br />{s}</div>
        ))}
      </div>
    </div>
  );
}

function RoundNavigation({
  onPrev,
  onHome,
  onNext,
  nextLabel = "다음",
  prevDisabled = false,
  nextDisabled = false,
}: {
  onPrev: () => void;
  onHome: () => void;
  onNext: () => void;
  nextLabel?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${prevDisabled ? "bg-slate-100 text-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
      >
        ← 이전
      </button>
      <button
        type="button"
        onClick={onHome}
        className="rounded-2xl bg-blue-50 px-3 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100"
      >
        홈
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${nextDisabled ? "bg-slate-100 text-slate-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

export default function LearnerApp() {
  const [screen, setScreen] = useState(0);
  const [team, setTeam] = useState("");
  const [code, setCode] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [firstChoice, setFirstChoice] = useState<"A" | "B" | null>(null);
  const [secondChoice, setSecondChoice] = useState<"유지" | "보완" | "전환" | null>(null);
  const [reason, setReason] = useState("");
  const [concern, setConcern] = useState("");
  const [secondReason, setSecondReason] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [reviewChecks, setReviewChecks] = useState<boolean[]>(reviewItems.map(() => false));
  const [finalLines, setFinalLines] = useState(["", "", "", "", ""]);
  const round = rounds[roundIndex];

  const isFilled = (value: string) => value.trim().length > 0;
  const canEnter = isFilled(code) && isFilled(team);
  const canCompleteFirst = Boolean(firstChoice) && isFilled(reason) && isFilled(concern);
  const canCompleteSecond = Boolean(secondChoice) && isFilled(secondReason);
  const canCompleteAiQuestion = isFilled(aiQuestion);
  const canCompleteReview = reviewChecks.every(Boolean);
  const canCompleteFinal = finalLines.every(isFilled);

  const resetRoundInputs = () => {
    setFirstChoice(null);
    setSecondChoice(null);
    setReason("");
    setConcern("");
    setSecondReason("");
    setAiQuestion("");
    setReviewChecks(reviewItems.map(() => false));
    setFinalLines(["", "", "", "", ""]);
  };

  const startRound = (index: number) => {
    setRoundIndex(index);
    resetRoundInputs();
    setScreen(3);
  };

  const next = () => setScreen((s) => Math.min(s + 1, 15));
  const prev = () => setScreen((s) => Math.max(s - 1, 2));
  const goHome = () => setScreen(2);

  const handleSaveAndNext = () => {
    if (!firstChoice || !secondChoice || !canCompleteFinal) return;
    saveSubmission({
      id: `${code.trim()}-${team.trim()}-${round.id}`,
      sessionCode: code.trim(),
      teamName: team.trim(),
      roundId: round.id,
      roundTitle: round.title,
      firstChoice,
      firstReason: reason.trim(),
      concern: concern.trim(),
      secondChoice,
      secondReason: secondReason.trim(),
      aiQuestion: aiQuestion.trim(),
      aiFeedbackSummary: `${firstChoice} 선택 후 ${secondChoice} 방향으로 판단을 조정했습니다. 상사 기대, 팀원 과부하, 고객 관점의 리스크를 함께 점검할 필요가 있습니다.`,
      finalLines: finalLines.map((line) => line.trim()),
      aftermath: round.aftermath,
      createdAt: new Date().toISOString(),
    });
    next();
  };

  const getNavNextLabel = () => {
    if (screen === 12) return "저장";
    if (screen === 14) return "요약";
    return "다음";
  };
  const getNavNextDisabled = () => {
    if (screen === 4) return !canCompleteFirst;
    if (screen === 8) return !canCompleteSecond;
    if (screen === 9) return !canCompleteAiQuestion;
    if (screen === 11) return !canCompleteReview;
    if (screen === 12) return !canCompleteFinal;
    return false;
  };
  const handleNavNext = () => {
    if (getNavNextDisabled()) return;
    if (screen === 12) {
      handleSaveAndNext();
      return;
    }
    next();
  };
  const step = screen < 2 ? 0 : screen < 4 ? 1 : screen === 4 ? 2 : screen < 8 ? 3 : screen === 8 ? 4 : screen < 12 ? 5 : 6;

  return (
    <MobileShell step={step}>
      {screen >= 3 && screen <= 14 && (
        <RoundNavigation
          onPrev={prev}
          onHome={goHome}
          onNext={handleNavNext}
          nextLabel={getNavNextLabel()}
          prevDisabled={screen === 3}
          nextDisabled={getNavNextDisabled()}
        />
      )}

      {screen === 0 && (
        <div className="flex h-full flex-col justify-between gap-8">
          <div>
            <div className="mb-8 mt-3">
              <div className="text-lg font-extrabold text-blue-600">업무관리</div>
              <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-slate-900">Decision<br />Journey</h1>
              <p className="mt-4 text-sm leading-7 text-slate-500">실제 업무 속 딜레마를 경험하고<br />더 나은 리더십 결정을 만들어갑니다.</p>
            </div>
            <div className="mb-6 rounded-3xl bg-gradient-to-b from-blue-50 to-teal-50 p-5">
              <div className="relative h-48 rounded-3xl bg-gradient-to-b from-sky-100 to-white">
                <div className="absolute bottom-5 left-8 h-24 w-20 rounded-t-full bg-white shadow-lg" />
                <div className="absolute bottom-16 left-14 h-12 w-8 rounded-t-full bg-blue-600" />
                <div className="absolute bottom-6 right-4 h-16 w-40 rounded-full bg-blue-100" />
                <div className="absolute bottom-2 left-0 h-10 w-full rounded-t-[60%] bg-teal-100" />
              </div>
            </div>
            <Card className="space-y-4 p-5">
              <TextInput label="세션 코드" placeholder="예) ABC123" value={code} onChange={setCode} />
              <TextInput label="팀명 / 이름" placeholder="예) 새벽등대팀 / 홍길동" value={team} onChange={setTeam} />
              {!canEnter && <p className="text-center text-xs font-bold text-orange-500">세션 코드와 팀명/이름을 모두 입력해주세요.</p>}
              <PrimaryButton onClick={() => canEnter && setScreen(1)} disabled={!canEnter}>여정 시작하기</PrimaryButton>
            </Card>
          </div>
          <p className="text-center text-xs text-slate-400">참여 방법이 궁금하신가요?</p>
        </div>
      )}

      {screen === 1 && (
        <div className="space-y-5">
          <Pill>과정 소개</Pill>
          <h2 className="text-3xl font-black leading-tight text-slate-900">오늘의 목표는<br />정답 찾기가 아닙니다</h2>
          <p className="text-sm leading-7 text-slate-500">처음 판단하고, 돌발상황을 만난 뒤, 다시 판단을 조정합니다. 마지막에는 AI의 도움을 비판적으로 검토하고 나만의 결정문을 만듭니다.</p>
          <div className="grid gap-3">
            {["1차 판단", "돌발상황 3가지", "2차 판단", "AI 질문", "최종 5줄 결정문"].map((item, i) => (
              <Card key={item} className="flex items-center gap-4 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-sm font-extrabold text-blue-700">{i + 1}</div>
                <div className="font-bold text-slate-700">{item}</div>
              </Card>
            ))}
          </div>
          <PrimaryButton onClick={() => setScreen(2)}>라운드 선택하기</PrimaryButton>
        </div>
      )}

      {screen === 2 && (
        <div className="space-y-5">
          <div>
            <Pill>10라운드 여정</Pill>
            <h2 className="mt-3 text-2xl font-black text-slate-900">업무관리 딜레마</h2>
            <p className="mt-2 text-sm text-slate-500">우선 디자인 MVP에서 10라운드 구조를 확인합니다.</p>
          </div>
          <div className="space-y-3">
            {rounds.map((r, i) => (
              <button key={r.id} onClick={() => startRound(i)} className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200">
                <div className="flex items-center justify-between">
                  <Pill tone={i % 3 === 0 ? "blue" : i % 3 === 1 ? "teal" : "purple"}>라운드 {r.id}</Pill>
                  <span className="text-xs text-slate-400">시작하기 →</span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold text-slate-800">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 3 && (
        <div className="space-y-5">
          <div className="text-center"><Pill>라운드 {round.id}</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">상황 카드</h2>
          <div className="rounded-3xl bg-gradient-to-b from-blue-50 to-white p-5">
            <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-inner"><div className="h-20 w-20 rounded-3xl bg-blue-100" /></div>
            <h3 className="text-lg font-extrabold text-slate-800">{round.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{round.story}</p>
          </div>
          <Card className="p-5 text-center"><div className="text-xs font-bold text-blue-600">질문</div><div className="mt-2 text-lg font-extrabold leading-8 text-slate-900">{round.question}</div></Card>
          <PrimaryButton onClick={next}>1차 판단하기</PrimaryButton>
        </div>
      )}

      {screen === 4 && (
        <div className="space-y-4">
          <div className="text-center"><Pill>1차 판단</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">어떤 선택을<br />하시겠습니까?</h2>
          <OptionCard label="A" title={round.optionA} selected={firstChoice === "A"} onClick={() => setFirstChoice("A")} />
          <OptionCard label="B" title={round.optionB} selected={firstChoice === "B"} onClick={() => setFirstChoice("B")} tone="teal" />
          <TextArea label="선택 이유" placeholder="이 선택을 하는 이유를 적어주세요." value={reason} onChange={setReason} />
          <TextArea label="우려되는 점" placeholder="이 선택의 위험이나 우려되는 점은 무엇인가요?" value={concern} onChange={setConcern} rows={2} />
          {!canCompleteFirst && <p className="text-center text-xs font-bold text-orange-500">A/B 선택, 선택 이유, 우려되는 점을 모두 입력해야 다음으로 이동할 수 있습니다.</p>}
          <PrimaryButton onClick={next} disabled={!canCompleteFirst}>돌발상황 확인하기</PrimaryButton>
        </div>
      )}

      {[5, 6, 7].includes(screen) && (
        <div className="space-y-5">
          <div className="rounded-[2rem] bg-gradient-to-b from-slate-900 to-teal-800 p-5 text-white shadow-xl">
            <div className="text-center"><span className="rounded-full bg-white/10 px-4 py-1 text-xs font-bold">돌발상황 {screen - 4}</span></div>
            <h2 className="mt-5 text-center text-2xl font-black">추가 상황이<br />발생했습니다!</h2>
            <p className="mt-2 text-center text-sm text-white/70">새로운 변수를 확인하고 판단을 다시 준비하세요.</p>
          </div>
          <Card className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">{screen === 5 ? "👤" : screen === 6 ? "⚠️" : "📈"}</div>
            <div className="text-sm font-bold text-blue-600">돌발상황 {screen - 4}</div>
            <p className="mt-3 text-lg font-extrabold leading-8 text-slate-900">{round.surprises[screen - 5]}</p>
          </Card>
          <PrimaryButton onClick={next}>{screen === 7 ? "2차 판단으로 이동" : "다음 돌발상황"}</PrimaryButton>
        </div>
      )}

      {screen === 8 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="teal">2차 판단</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">이제 어떻게<br />하시겠습니까?</h2>
          <OptionCard label="유지" title="기존 선택을 유지한다" desc="1차 판단의 방향을 그대로 실행합니다." selected={secondChoice === "유지"} onClick={() => setSecondChoice("유지")} />
          <OptionCard label="보완" title="기존 선택을 보완한다" desc="방향은 유지하되 조건과 실행방식을 조정합니다." selected={secondChoice === "보완"} onClick={() => setSecondChoice("보완")} tone="teal" />
          <OptionCard label="전환" title="접근 방식을 전환한다" desc="새로운 변수에 맞춰 판단 방향을 바꿉니다." selected={secondChoice === "전환"} onClick={() => setSecondChoice("전환")} tone="purple" />
          <TextArea label="2차 판단 이유" placeholder="새롭게 중요해진 변수와 감수해야 할 비용을 적어주세요." value={secondReason} onChange={setSecondReason} />
          {!canCompleteSecond && <p className="text-center text-xs font-bold text-orange-500">유지/보완/전환 선택과 2차 판단 이유를 모두 입력해주세요.</p>}
          <PrimaryButton onClick={next} disabled={!canCompleteSecond}>AI 질문 작성하기</PrimaryButton>
        </div>
      )}

      {screen === 9 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="purple">AI 질문</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">AI에게 무엇을<br />물어보시겠습니까?</h2>
          <TextArea label="AI에게 묻고 싶은 질문" placeholder="예: 이 판단에서 제가 놓친 이해관계자 리스크는 무엇인가요?" value={aiQuestion} onChange={setAiQuestion} rows={6} />
          <Card className="bg-blue-50/70 p-4"><div className="text-sm font-extrabold text-blue-700">좋은 질문의 구조</div><p className="mt-2 text-sm leading-6 text-slate-600">역할 + 상황 + 선택 + 우려 + 원하는 출력 형식을 함께 넣으면 더 나은 피드백을 받을 수 있습니다.</p></Card>
          {!canCompleteAiQuestion && <p className="text-center text-xs font-bold text-orange-500">AI에게 묻고 싶은 질문을 입력해주세요.</p>}
          <PrimaryButton onClick={next} disabled={!canCompleteAiQuestion}>AI 피드백 보기</PrimaryButton>
        </div>
      )}

      {screen === 10 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="purple">AI 피드백 예시</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">AI는 이렇게<br />판단을 넓혀줍니다</h2>
          <Card className="space-y-4 p-5">
            <div><div className="text-xs font-bold text-blue-600">판단 요약</div><p className="mt-1 text-sm leading-6 text-slate-600">당신은 {firstChoice} 선택 후 돌발상황을 반영해 ‘{secondChoice}’ 방향으로 판단을 조정했습니다.</p></div>
            <div><div className="text-xs font-bold text-teal-600">강점</div><p className="mt-1 text-sm leading-6 text-slate-600">상황 변화에 따라 기존 판단의 비용을 다시 살펴보려는 점이 좋습니다.</p></div>
            <div><div className="text-xs font-bold text-orange-600">놓친 관점</div><p className="mt-1 text-sm leading-6 text-slate-600">상사의 보고 기대, 팀원의 과부하, 고객 관점의 리스크를 함께 점검할 필요가 있습니다.</p></div>
          </Card>
          <PrimaryButton onClick={next}>AI 답변 검토하기</PrimaryButton>
        </div>
      )}

      {screen === 11 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="orange">비판적 검토</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">AI 답변을 그대로<br />믿지 마세요</h2>
          {reviewItems.map((q, index) => (
            <label key={q} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <input
                type="checkbox"
                checked={reviewChecks[index]}
                onChange={(event) => setReviewChecks((checks) => checks.map((checked, i) => i === index ? event.target.checked : checked))}
                className="h-5 w-5 rounded border-slate-300"
              />
              <span className="text-sm font-semibold leading-6 text-slate-700">{q}</span>
            </label>
          ))}
          {!canCompleteReview && <p className="text-center text-xs font-bold text-orange-500">AI 답변 검토 항목을 모두 확인해야 다음으로 이동할 수 있습니다.</p>}
          <PrimaryButton onClick={next} disabled={!canCompleteReview}>최종 결정문 작성하기</PrimaryButton>
        </div>
      )}

      {screen === 12 && (
        <div className="space-y-4">
          <div className="text-center"><Pill>최종 결정</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">우리 팀의 최종 결정을<br />5줄로 작성하세요</h2>
          {["나는 이 상황을", "나의 최종 선택은", "이 선택의 가장 큰 비용은", "그래서 붙일 실행 조건은", "내일 바로 할 첫 행동은"].map((label, i) => (
            <TextInput key={label} label={`${i + 1}. ${label}`} placeholder="내용을 입력하세요" value={finalLines[i]} onChange={(v) => setFinalLines((arr) => arr.map((x, idx) => idx === i ? v : x))} />
          ))}
          {!canCompleteFinal && <p className="text-center text-xs font-bold text-orange-500">최종 5줄 결정문을 모두 입력해야 저장할 수 있습니다.</p>}
          <PrimaryButton onClick={handleSaveAndNext} disabled={!canCompleteFinal}>제출하고 저장하기</PrimaryButton>
        </div>
      )}

      {screen === 13 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="orange">후폭풍</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">선택에는 반드시<br />비용이 따릅니다</h2>
          <Card className="p-5"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">🌊</div><p className="text-base font-bold leading-8 text-slate-800">{round.aftermath}</p></Card>
          <PrimaryButton onClick={next}>로그북 저장하기</PrimaryButton>
        </div>
      )}

      {screen === 14 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="green">로그북</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">이번 라운드의<br />판단 흔적</h2>
          <Card className="space-y-3 p-5 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">브라우저 임시 저장소에 저장되었습니다. 같은 브라우저의 /instructor에서 확인할 수 있습니다.</div>
            <div className="flex justify-between"><span className="text-slate-500">1차 판단</span><b className="text-blue-700">{firstChoice || "A"}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">2차 판단</span><b className="text-teal-700">{secondChoice || "보완"}</b></div>
            <div className="border-t border-slate-100 pt-3 text-slate-700">{finalLines.filter(Boolean).join(" / ") || "최종 5줄 결정문이 이곳에 저장됩니다."}</div>
          </Card>
          <PrimaryButton onClick={next}>전체 여정 보기</PrimaryButton>
        </div>
      )}

      {screen === 15 && (
        <div className="space-y-5">
          <div className="text-center"><Pill>여정 요약</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">오늘의 판단 여정이<br />저장되었습니다</h2>
          <div className="grid grid-cols-2 gap-3"><Card className="p-4 text-center"><div className="text-3xl font-black text-blue-600">3</div><div className="mt-1 text-xs font-bold text-slate-500">완료 라운드</div></Card><Card className="p-4 text-center"><div className="text-3xl font-black text-teal-600">2</div><div className="mt-1 text-xs font-bold text-slate-500">판단 변화</div></Card></div>
          <Card className="p-5"><div className="text-sm font-extrabold text-slate-800">나의 주요 판단 패턴</div><p className="mt-2 text-sm leading-7 text-slate-600">초기에는 일정과 실행 가능성을 중시했지만, 돌발상황 이후 품질·관계·보고 리스크를 함께 고려하는 방향으로 판단이 확장되었습니다.</p></Card>
          <PrimaryButton onClick={() => { resetRoundInputs(); setScreen(2); }}>다른 라운드 보기</PrimaryButton>
        </div>
      )}
    </MobileShell>
  );
}
