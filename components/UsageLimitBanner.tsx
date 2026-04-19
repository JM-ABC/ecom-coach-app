import { Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageLimitBannerProps {
  remaining: number;
  limit: number;
  isLimitReached: boolean;
}

const UsageLimitBanner = ({ remaining, limit, isLimitReached }: UsageLimitBannerProps) => {
  if (isLimitReached) {
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <p className="font-semibold text-amber-900">오늘 무료 사용을 모두 했어요</p>
        </div>
        <p className="text-sm text-amber-700">
          하루 {limit}회 무료 제한에 도달했습니다. 내일 다시 이용하거나 Pro로 업그레이드하세요.
        </p>
        <Button className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
          <Crown className="h-4 w-4" />
          Pro 업그레이드 (월 14,900원)
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">
        오늘 남은 무료 횟수:
      </span>
      <span className="text-sm font-semibold text-primary">
        {remaining}/{limit}
      </span>
    </div>
  );
};

export default UsageLimitBanner;
