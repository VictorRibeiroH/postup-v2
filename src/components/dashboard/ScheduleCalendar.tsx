"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Instagram, Facebook } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  title: string;
  scheduled_for: string;
  platform: string;
  status: string;
  arte_id?: string;
  artes?: {
    image_url: string;
    title: string;
  };
}

interface ScheduleCalendarProps {
  onScheduleClick?: () => void;
}

export default function ScheduleCalendar({ onScheduleClick }: ScheduleCalendarProps = {}) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("scheduled_posts")
        .select(`
          *,
          artes (
            image_url,
            title
          )
        `)
        .eq("user_id", user.id)
        .gte("scheduled_for", start.toISOString())
        .lte("scheduled_for", end.toISOString())
        .order("scheduled_for", { ascending: true });

      if (error && error.message) {
        console.error("Erro ao carregar posts:", error);
        toast.error("Erro ao carregar agendamentos");
        return;
      }
      
      setPosts(data || []);
    } catch (error) {
      console.error("Erro inesperado ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) =>
      isSameDay(new Date(post.scheduled_for), date)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === "instagram") return <Instagram className="w-3 h-3" />;
    if (platform === "facebook") return <Facebook className="w-3 h-3" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    if (status === "published") return "bg-green-100 text-green-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    if (status === "cancelled") return "bg-gray-100 text-gray-700";
    return "bg-blue-100 text-blue-700";
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6400]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Agendamentos</h3>
            <p className="text-sm text-gray-600 mt-1">
              {posts.length} {posts.length === 1 ? "post agendado" : "posts agendados"} este mês
            </p>
          </div>
          <Button
            onClick={onScheduleClick}
            className="bg-[#FF6400] hover:bg-[#e55a00]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agendar Post
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            ← Anterior
          </Button>
          <h4 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h4>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            Próximo →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Week days header */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayPosts = getPostsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative min-h-[80px] p-2 rounded-lg border transition-all
                  ${isSelected ? "border-[#FF6400] bg-[#FF6400]/10" : "border-gray-200"}
                  ${isTodayDate ? "bg-blue-50" : "bg-white"}
                  hover:border-[#FF6400] hover:shadow-md
                `}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isTodayDate ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {format(day, "d")}
                </div>

                {/* Posts indicators */}
                {dayPosts.length > 0 && (
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`text-[10px] px-1 py-0.5 rounded flex items-center gap-1 ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {getPlatformIcon(post.platform)}
                        <span className="truncate">{post.title.substring(0, 8)}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-[10px] text-gray-500">
                        +{dayPosts.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date details */}
        {selectedDate && selectedDatePosts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">
              Posts em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h4>
            <div className="space-y-2">
              {selectedDatePosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  {post.artes?.image_url && (
                    <img
                      src={post.artes.image_url}
                      alt={post.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(post.scheduled_for), "HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedDatePosts.length === 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Nenhum post agendado para{" "}
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
