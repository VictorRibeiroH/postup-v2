"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Image as ImageIcon, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ArtesGallery from "@/components/dashboard/ArtesGallery";
import ScheduleCalendar from "@/components/dashboard/ScheduleCalendar";
import SchedulePostModal from "@/components/dashboard/SchedulePostModal";

type UserProfile = {
  full_name: string;
  email: string;
  company_name: string | null;
  plan_id: string;
  plan_name?: string;
  artes_used: number;
  artes_limit: number;
  has_ads: boolean;
  has_dashboard: boolean;
};

type Subscription = {
  start_date: string;
  end_date: string;
  status: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const loadUserProfile = async () => {
    try {
      const supabase = createClient();
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Load profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        throw error;
      }
      
      // Load plan name
      let planName = data.plan_id;
      if (data.plan_id && data.plan_id.length === 36) { // UUID tem 36 caracteres
        const { data: planData } = await supabase
          .from("plans")
          .select("name")
          .eq("id", data.plan_id)
          .single();
        
        if (planData) {
          planName = planData.name;
        }
      }
      
      setProfile({
        ...data,
        plan_name: planName
      });

      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("start_date, end_date, status")
        .eq("user_id", user.id)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6400] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const percentUsed = (profile.artes_used / profile.artes_limit) * 100;

  // Calculate days remaining
  const daysRemaining = subscription
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : null;

  const subscriptionExpired = daysRemaining !== null && daysRemaining < 0;
  const subscriptionExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Post<span className="text-[#FF6400]">Up</span>
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {profile.full_name}! 👋
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao seu painel de gerenciamento
          </p>
        </div>

        {/* Subscription Alert */}
        {subscriptionExpired && (
          <Card className="mb-6 backdrop-blur-xl bg-red-50/80 border-red-200/50 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Assinatura Expirada</p>
                <p className="text-sm text-red-700">
                  Sua assinatura expirou. Renove agora para continuar criando artes!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {subscriptionExpiringSoon && !subscriptionExpired && (
          <Card className="mb-6 backdrop-blur-xl bg-yellow-50/80 border-yellow-200/50 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Assinatura expirando em breve</p>
                <p className="text-sm text-yellow-700">
                  Sua assinatura expira em {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}. Renove para não perder acesso!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Info Card */}
        <Card className="mb-8 backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Seu Plano</p>
                <h3 className="text-2xl font-bold text-[#FF6400] uppercase">
                  {profile.plan_name || profile.plan_id}
                </h3>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Artes Utilizadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.artes_used} / {profile.artes_limit}
                </p>
              </div>
              {subscription && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assinatura</p>
                  <div className="flex items-center gap-2">
                    {subscriptionExpired ? (
                      <span className="text-2xl font-bold text-red-600">Expirada</span>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
                          </p>
                          <p className="text-xs text-gray-500">
                            até {format(new Date(subscription.end_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF6400] to-[#ff8c00] h-full rounded-full transition-all duration-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {profile.artes_limit - profile.artes_used} artes disponíveis este mês
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            onClick={() => router.push("/editor")}
            className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6400]/10 mb-4">
                <ImageIcon className="w-8 h-8 text-[#FF6400]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Editor de Artes
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Crie artes personalizadas com nosso editor profissional
              </p>
              <Button className="w-full bg-[#FF6400] hover:bg-[#e55a00]">
                Abrir Editor
              </Button>
            </CardContent>
          </Card>

          <Card
            onClick={() => router.push("/dashboard/social-accounts")}
            className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Redes Sociais
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Conecte Facebook e Instagram para agendar posts
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Conectar Contas
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agendamentos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Agende posts nas suas redes sociais
              </p>
              <Button 
                onClick={() => setScheduleModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Agendar Post
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Artes Gallery */}
        <div className="mb-8">
          <ArtesGallery />
        </div>

        {/* Schedule Calendar */}
        <div className="mb-8">
          <ScheduleCalendar onScheduleClick={() => setScheduleModalOpen(true)} />
        </div>

        {/* Coming Soon Section - Removed as features are now implemented */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 PostUp. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="/privacy" 
                className="text-sm text-gray-600 hover:text-[#FF6400] transition-colors"
              >
                Política de Privacidade
              </a>
              <a 
                href="/terms" 
                className="text-sm text-gray-600 hover:text-[#FF6400] transition-colors"
              >
                Termos de Serviço
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Schedule Post Modal */}
      <SchedulePostModal 
        open={scheduleModalOpen} 
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => {
          loadUserProfile();
        }}
      />
    </div>
  );
}
