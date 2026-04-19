import { Crown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingFooter = () => {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-4 py-10">
        {/* Comparison */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-lg font-bold text-foreground mb-2">
            외주비 30만원 vs Pro 월 14,900원
          </h2>
          <p className="text-sm text-muted-foreground">
            상품명 최적화, 카피 작성, 상세페이지 디자인까지 — AI가 몇 분 만에 완성합니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <p className="font-semibold text-foreground">무료</p>
            <p className="text-2xl font-bold text-foreground">₩0<span className="text-sm font-normal text-muted-foreground">/월</span></p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 하루 3회 상품명·카피 생성</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 마케팅 캘린더 기본 열람</li>
              <li className="flex items-center gap-2 text-muted-foreground"><X className="h-4 w-4 shrink-0" /> 상세페이지 워터마크 포함</li>
              <li className="flex items-center gap-2 text-muted-foreground"><X className="h-4 w-4 shrink-0" /> Pro 실무 코멘트</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50/50 p-5 space-y-3 relative">
            <div className="absolute -top-3 left-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                <Crown className="h-3 w-3" /> 추천
              </span>
            </div>
            <p className="font-semibold text-foreground">Pro</p>
            <p className="text-2xl font-bold text-foreground">₩14,900<span className="text-sm font-normal text-muted-foreground">/월</span></p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 shrink-0" /> 무제한 상품명·카피 생성</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 shrink-0" /> 상세페이지 워터마크 없이 다운로드</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 shrink-0" /> Pro 실무 코멘트 전체 열람</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 shrink-0" /> 우선 지원</li>
            </ul>
            <Button className="w-full gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
              <Crown className="h-4 w-4" /> Pro 시작하기
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 셀러 마케팅 툴킷. 이커머스 셀러를 위한 올인원 마케팅 도구.
        </p>
      </div>
    </footer>
  );
};

export default PricingFooter;
