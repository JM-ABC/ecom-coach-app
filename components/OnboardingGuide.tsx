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
import { Search, PenLine, Layout, CalendarDays, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "① 상품명 최적화로 시작하세요",
    description: "팔고 싶은 상품의 키워드를 입력하면, 쿠팡·네이버·11번가 각 플랫폼의 검색 알고리즘에 맞춘 최적 상품명을 AI가 만들어드립니다.",
    tip: "💡 생성된 상품명의 '노출 키워드' 배지를 확인하면 어떤 검색어로 노출되는지 한눈에 파악할 수 있어요.",
  },
  {
    icon: PenLine,
    title: "② 카피 생성으로 연결",
    description: "마음에 드는 상품명 옆 화살표(→)를 클릭하면 바로 카피 생성 탭으로 넘어갑니다. 인스타 공구용, 블로그 체험단용 등 용도에 맞는 문체를 선택하세요.",
    tip: "💡 톤 슬라이더로 '전문적 ↔ 친근한' 문체를 조절할 수 있어요. AI가 만든 티가 나지 않는 자연스러운 카피가 나옵니다.",
  },
  {
    icon: Layout,
    title: "③ 상세페이지 완성",
    description: "생성된 카피를 바탕으로 템플릿을 선택하면, 바로 올릴 수 있는 HTML 상세페이지가 완성됩니다. (Pro 기능)",
    tip: "💡 무료 사용자도 미리보기는 가능해요. Pro로 업그레이드하면 워터마크 없이 다운로드할 수 있습니다.",
  },
  {
    icon: CalendarDays,
    title: "④ 캘린더로 타이밍 잡기",
    description: "블랙프라이데이, 빼빼로데이 등 이커머스 핵심 행사 일정을 캘린더에서 확인하고, 프로모션 준비 타이밍을 놓치지 마세요.",
    tip: "💡 Pro 사용자는 각 행사별 실무 코멘트(준비 시작일, 광고 세팅 팁 등)를 열람할 수 있어요.",
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
            🚀 1분 가이드 — 매출 올리는 순서
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
              <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
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
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>

            {isLast ? (
              <Button size="sm" onClick={handleClose} className="gap-1">
                시작하기 🎉
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1">
                다음
                <ChevronRight className="h-4 w-4" />
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
