import { TrophyIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const PricingFooter = () => {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-4 py-10">
        {/* Comparison */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-lg font-bold text-foreground mb-2">
            맘큐 MD의 기획력을 AI로 확장하세요
          </h2>
          <p className="text-sm text-muted-foreground">
            시즌 캘린더·실무 인사이트는 지금 바로, 상품명·카피·상세페이지는 곧 오픈됩니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <p className="font-semibold text-foreground">무료</p>
            <p className="text-2xl font-bold text-foreground">₩0<span className="text-sm font-normal text-muted-foreground">/월</span></p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> 마케팅 캘린더 전체 열람</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> 이벤트 체크리스트 확인</li>
              <li className="flex items-center gap-2 text-muted-foreground"><XMarkIcon className="h-4 w-4 shrink-0" /> Pro 실무 코멘트 잠금</li>
              <li className="flex items-center gap-2 text-muted-foreground"><XMarkIcon className="h-4 w-4 shrink-0" /> 맘큐 단독 인사이트 잠금</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50/50 p-5 space-y-3 relative">
            <div className="absolute -top-3 left-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                <TrophyIcon className="h-3 w-3" /> 추천
              </span>
            </div>
            <p className="font-semibold text-foreground">Pro</p>
            <p className="text-2xl font-bold text-foreground">₩14,900<span className="text-sm font-normal text-muted-foreground">/월</span></p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-amber-500 shrink-0" /> Pro 실무 코멘트 전체 열람</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-amber-500 shrink-0" /> 맘큐 단독 기획 인사이트</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-amber-500 shrink-0" /> 신규 기능 우선 오픈 (상품명·카피 등)</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-amber-500 shrink-0" /> 우선 지원</li>
            </ul>
            <Button className="w-full gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
              <TrophyIcon className="h-4 w-4" /> Pro 시작하기
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 맘큐 MD 플래너. 맘큐 D2C 브랜드 마케팅 기획 툴.
        </p>
      </div>
    </footer>
  );
};

export default PricingFooter;
