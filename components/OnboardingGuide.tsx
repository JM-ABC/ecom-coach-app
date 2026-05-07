import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  {
    icon: CalendarDaysIcon,
    title: "① 마케팅 캘린더로 시즌 기획",
    description: "어버이날, 맘큐 단독 기획전, 육아 시즌 등 D2C 브랜드에 꼭 필요한 이벤트를 한눈에 확인하세요. 쿠팡·네이버·맘큐 자사몰 일정을 함께 관리할 수 있습니다.",
    tip: "💡 월간·주간·포커스 탭을 전환하며 다음 시즌 준비 현황을 빠르게 파악하세요.",
  },
  {
    icon: MagnifyingGlassIcon,
    title: "② 포커스 탭으로 기회 포착",
    description: "기회점수가 높은 이벤트를 우선 정렬해 보여줍니다. D-day 배지로 준비 기한을 놓치지 않고, 맘큐 D2C 브랜드에 맞는 프로모션 우선순위를 잡을 수 있어요.",
    tip: "💡 기회점수 80점 이상 이벤트는 황금 별★로 표시됩니다. MD 기획 우선순위로 활용하세요.",
  },
  {
    icon: Squares2X2Icon,
    title: "③ 이벤트 상세로 실무 인사이트",
    description: "각 이벤트 카드를 클릭하면 준비 체크리스트, 전년도 GMV 트렌드, 맘큐 커뮤니티 반응 등 MD 실무에 필요한 인사이트를 확인할 수 있습니다.",
    tip: "💡 '액션 플랜' 버튼으로 해당 이벤트의 단계별 준비 가이드를 열어보세요.",
  },
  {
    icon: PencilIcon,
    title: "④ 곧 오픈 — 상품명·카피·상세페이지",
    description: "맘큐 D2C 브랜드에 최적화된 상품명 자동 생성, 맘 커뮤니티 감성 카피, 자사몰 상세페이지 템플릿이 준비 중입니다.",
    tip: "💡 오픈 알림을 받으려면 설정에서 이메일을 등록해두세요.",
  },
];

interface OnboardingGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingGuide = ({ open, onOpenChange }: OnboardingGuideProps) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("onboarding_seen", "true");
    }
    onOpenChange(false);
    setStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            📋 1분 가이드 — MD 기획 시작하기
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-5">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="font-bold text-base text-foreground">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-accent/60 p-3">
            <p className="text-xs text-foreground leading-relaxed">{current.tip}</p>
          </div>

          {/* Flow arrow (except last) */}
          {!isLast && (
            <div className="flex justify-center">
              <ArrowRightIcon className="h-5 w-5 text-primary animate-pulse" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={isFirst}
              className="gap-1"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              이전
            </Button>

            {isLast ? (
              <Button size="sm" onClick={handleClose} className="gap-1">
                시작하기 🎉
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1">
                다음
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-center">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(v) => setDontShowAgain(!!v)}
            />
            <span className="text-xs text-muted-foreground">다시 보지 않기</span>
          </label>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingGuide;
