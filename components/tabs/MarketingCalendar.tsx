import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Crown,
  Tag,
  MapPin,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  categories: string[];
  platforms: string[];
  description: string | null;
  pro_comment: string | null;
  color: string | null;
  year: number;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  holiday: "공휴일/기념일",
  season: "시즌",
  platform: "플랫폼 행사",
  promotion: "프로모션",
};

const CATEGORY_FILTERS = [
  "전체",
  "식품",
  "생활용품",
  "패션",
  "뷰티",
  "가전",
  "유아용품",
];

const PLATFORM_MAP: Record<string, string> = {
  coupang: "쿠팡",
  naver: "네이버",
  "11st": "11번가",
};

const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const MarketingCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isPro] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("year", 2026)
        .order("start_date");
      if (!error && data) {
        setEvents(data as unknown as CalendarEvent[]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "전체") return events;
    return events.filter((e) => e.categories?.includes(selectedCategory));
  }, [events, selectedCategory]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => {
      const start = new Date(e.start_date);
      const end = e.end_date ? new Date(e.end_date) : start;
      const monthStart = new Date(2026, currentMonth, 1);
      const monthEnd = new Date(2026, currentMonth + 1, 0);
      return start <= monthEnd && end >= monthStart;
    });
  }, [filteredEvents, currentMonth]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(2026, currentMonth, 1).getDay();
    const daysInMonth = new Date(2026, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const getEventsForDay = (day: number) => {
    const dateStr = `2026-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const date = new Date(dateStr);
    return filteredEvents.filter((e) => {
      const start = new Date(e.start_date);
      const end = e.end_date ? new Date(e.end_date) : start;
      return date >= start && date <= end;
    });
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Month Nav */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))}
                disabled={currentMonth === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold min-w-[80px] text-center">
                2026년 {MONTHS[currentMonth]}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => Math.min(11, m + 1))}
                disabled={currentMonth === 11}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                onClick={() => setView("calendar")}
              >
                <Grid3X3 className="h-3.5 w-3.5 mr-1" />
                캘린더
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                onClick={() => setView("list")}
              >
                <List className="h-3.5 w-3.5 mr-1" />
                리스트
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {CATEGORY_FILTERS.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {view === "calendar" && (
        <Card>
          <CardContent className="p-2 sm:p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {calendarDays.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] sm:min-h-[100px] bg-card p-1 sm:p-1.5 ${
                      !day ? "bg-muted/30" : ""
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-xs text-muted-foreground">{day}</span>
                        <div className="mt-0.5 space-y-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className="cursor-pointer rounded px-1 py-0.5 text-[10px] sm:text-xs leading-tight truncate hover:opacity-80 transition-opacity"
                              style={{
                                background: ev.color || "#4F46E5",
                                color: "#fff",
                              }}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="space-y-2">
          {monthEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                이 달에는 해당 카테고리의 이벤트가 없습니다.
              </CardContent>
            </Card>
          ) : (
            monthEvents.map((ev) => (
              <Card
                key={ev.id}
                className="cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                onClick={() => setSelectedEvent(ev)}
              >
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ background: ev.color || "#4F46E5" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{ev.title}</p>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(ev.start_date)}
                      {ev.end_date && ev.end_date !== ev.start_date
                        ? ` ~ ${formatDate(ev.end_date)}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {ev.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ev.platforms?.map((p) => (
                        <Badge key={p} variant="outline" className="text-[10px] h-4">
                          {PLATFORM_MAP[p] || p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: selectedEvent.color || "#4F46E5" }}
                />
                <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Date & Type */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {formatDate(selectedEvent.start_date)}
                  {selectedEvent.end_date &&
                  selectedEvent.end_date !== selectedEvent.start_date
                    ? ` ~ ${formatDate(selectedEvent.end_date)}`
                    : ""}
                </Badge>
                <Badge variant="secondary">
                  {EVENT_TYPE_LABELS[selectedEvent.event_type] ||
                    selectedEvent.event_type}
                </Badge>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">설명</p>
                  <p className="text-sm leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Categories */}
              {selectedEvent.categories?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    관련 카테고리
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.categories.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {selectedEvent.platforms?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    판매 플랫폼
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {PLATFORM_MAP[p] || p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Comment */}
              {selectedEvent.pro_comment && (
                <div className="relative">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Crown className="h-3 w-3 text-amber-500" />
                    Pro 실무 코멘트
                  </p>
                  {isPro ? (
                    <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3">
                      {selectedEvent.pro_comment}
                    </p>
                  ) : (
                    <div className="relative">
                      <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3 blur-sm select-none">
                        {selectedEvent.pro_comment}
                      </p>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 rounded-lg backdrop-blur-[2px]">
                        <Lock className="h-5 w-5 text-muted-foreground mb-1.5" />
                        <p className="text-xs text-muted-foreground mb-2">
                          Pro 전용 실무 코멘트
                        </p>
                        <Button size="sm" className="h-7 text-xs gap-1">
                          <Crown className="h-3 w-3" />
                          Pro로 확인하기
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default MarketingCalendar;
