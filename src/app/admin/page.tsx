"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Users, BarChart3, FileText } from "lucide-react";
import VideoSettingsCard from "@/components/admin/VideoSettingsCard";
import PartnersManagementCard from "@/components/admin/PartnersManagementCard";
import PlansManagementCard from "@/components/admin/PlansManagementCard";
import SegmentsManagementCard from "@/components/admin/SegmentsManagementCard";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import SubscriptionManagementCard from "@/components/admin/SubscriptionManagementCard";
import AuditLogsCard from "@/components/admin/AuditLogsCard";

type AdminProfile = {
  full_name: string;
  email: string;
  user_type: string;
};

type User = {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  plan_id: string;
  created_at: string;
  subscription?: {
    end_date: string;
    status: string;
  };
};

type DetailedStats = {
  totalUsers: number;
  activeSubscriptions: number;
  expiringSoon: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  growthRate: number;
  registrationsByMonth: Array<{ month: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [daysToExtend, setDaysToExtend] = useState<number>(30);
  const [actionLoading, setActionLoading] = useState(false);
  const [adjustMode, setAdjustMode] = useState<"add" | "set">("add"); // add = adicionar, set = definir total
  
  // Filtros
  const [searchName, setSearchName] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAdminData = async () => {
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
        .select("full_name, email, user_type")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Check if user is admin
      if (data.user_type !== "admin") {
        router.push("/dashboard");
        return;
      }
      
      setProfile(data);

      // Load stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .neq("id", user.id);

      const { count: subsCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { data: revenueData } = await supabase
        .from("subscriptions")
        .select("price")
        .eq("status", "active");

      const totalRevenue = revenueData?.reduce((sum, sub) => sum + Number(sub.price), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        activeSubscriptions: subsCount || 0,
        totalRevenue,
      });

      // Load users com informações de subscription (todos exceto o admin logado)
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          email, 
          company_name, 
          plan_id, 
          created_at, 
          user_type,
          subscriptions(end_date, status)
        `)
        .neq("id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (usersError) {
        console.error("Erro ao carregar usuários:", usersError);
      }
      
      // Processar dados da subscription (pode vir como array)
      const processedUsers = (usersData || []).map(user => ({
        ...user,
        subscription: Array.isArray(user.subscriptions) 
          ? user.subscriptions[0] 
          : user.subscriptions
      }));
      
      console.log("Usuários carregados:", processedUsers);
      setUsers(processedUsers);

      // Load detailed stats
      await loadDetailedStats(supabase, usersCount || 0, subsCount || 0, totalRevenue);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedStats = async (
    supabase: ReturnType<typeof createClient>,
    totalUsers: number,
    activeSubscriptions: number,
    totalRevenue: number
  ) => {
    try {
      // Calcular assinaturas expirando em 7 dias
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      
      const { count: expiringSoonCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lte("end_date", in7Days.toISOString())
        .gte("end_date", new Date().toISOString());

      // Usuários novos este mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Crescimento (mês anterior vs este mês)
      const startOfLastMonth = new Date(startOfMonth);
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

      const { count: lastMonthUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfLastMonth.toISOString())
        .lt("created_at", startOfMonth.toISOString());

      const growthRate = lastMonthUsers
        ? ((((newUsersThisMonth || 0) - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1)
        : "0";

      // Cadastros por mês (últimos 6 meses)
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: false });

      const registrationsByMonth = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString("pt-BR", { month: "short" });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = allProfiles?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length || 0;

        return { month: monthName, count };
      }).reverse();

      // Receita por mês (simulada - você pode melhorar isso com dados reais)
      const revenueByMonth = registrationsByMonth.map(item => ({
        month: item.month,
        revenue: item.count * (totalRevenue / totalUsers || 0)
      }));

      setDetailedStats({
        totalUsers,
        activeSubscriptions,
        expiringSoon: expiringSoonCount || 0,
        totalRevenue,
        monthlyRevenue: totalRevenue,
        newUsersThisMonth: newUsersThisMonth || 0,
        growthRate: parseFloat(growthRate),
        registrationsByMonth,
        revenueByMonth,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas detalhadas:", error);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Função para estender plano do usuário
  const handleExtendPlan = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const supabase = createClient();
      
      // Buscar subscription atual
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", selectedUser.id)
        .single();

      if (!subscription) {
        toast.error("Usuário não possui assinatura ativa");
        return;
      }

      let newEndDate: Date;

      if (adjustMode === "add") {
        // Modo adicionar: adiciona dias à data atual de expiração
        const currentEndDate = new Date(subscription.end_date);
        newEndDate = new Date(currentEndDate.getTime() + daysToExtend * 24 * 60 * 60 * 1000);
      } else {
        // Modo definir: define nova data a partir de hoje
        newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + daysToExtend);
      }

      // Atualizar subscription
      const { error } = await supabase
        .from("subscriptions")
        .update({ 
          end_date: newEndDate.toISOString(),
          status: "active"
        })
        .eq("id", subscription.id);

      if (error) throw error;

      const message = adjustMode === "add" 
        ? `Plano estendido por ${daysToExtend} dias!`
        : `Plano ajustado para ${daysToExtend} dias a partir de hoje!`;
      
      toast.success(message);
      setShowExtendModal(false);
      setSelectedUser(null);
      setDaysToExtend(30);
      setAdjustMode("add");
      loadAdminData();
    } catch (error: any) {
      console.error("Erro ao estender plano:", error);
      toast.error("Erro ao estender plano: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Função para banir usuário
  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const supabase = createClient();
      
      // Desativar subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", selectedUser.id);

      if (subError) throw subError;

      toast.success("Usuário banido com sucesso!");
      setShowBanModal(false);
      setSelectedUser(null);
      loadAdminData();
    } catch (error: any) {
      console.error("Erro ao banir usuário:", error);
      toast.error("Erro ao banir usuário: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Função para deletar usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const supabase = createClient();
      
      // Deletar subscription primeiro (foreign key)
      await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", selectedUser.id);

      // Deletar perfil
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Usuário deletado com sucesso!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadAdminData();
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      toast.error("Erro ao deletar usuário: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesName = user.full_name.toLowerCase().includes(searchName.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchName.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan_id === filterPlan;
    return matchesName && matchesPlan;
  });

  // Obter planos únicos para o filtro
  const uniquePlans = Array.from(new Set(users.map(u => u.plan_id)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6400] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Post<span className="text-[#FF6400]">Up</span> <span className="text-sm font-normal text-gray-500">Admin</span>
            </h1>
          </div>
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
            Olá, {profile.full_name}! 👨‍💼
          </h2>
          <p className="text-gray-600">
            Painel administrativo da plataforma
          </p>
        </div>

        {/* Estatísticas Detalhadas */}
        {detailedStats && (
          <div className="mb-8">
            <AdminStatsCard stats={detailedStats} />
          </div>
        )}

        {/* Gestão de Assinaturas */}
        <div className="mb-8">
          <SubscriptionManagementCard />
        </div>

        {/* Logs de Auditoria */}
        <div className="mb-8">
          <AuditLogsCard />
        </div>

        {/* Admin Actions */}
        <div className="mb-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Configurações do Site
          </h3>
          <VideoSettingsCard />
          <PartnersManagementCard />
          <PlansManagementCard />
          <SegmentsManagementCard />
        </div>

        {/* Users List */}
        <div className="mb-8">
          <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Usuários Cadastrados
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredUsers.length} de {users.length} usuários
                  </p>
                </div>
              </div>

              {/* Filtros */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por nome ou email
                  </label>
                  <input
                    type="text"
                    placeholder="Digite para buscar..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400] focus:ring-2 focus:ring-[#FF6400]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por plano
                  </label>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400] focus:ring-2 focus:ring-[#FF6400]/20"
                  >
                    <option value="all">Todos os planos</option>
                    {uniquePlans.map(plan => (
                      <option key={plan} value={plan}>{plan.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Empresa</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plano</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Validade</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cadastro</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          {searchName || filterPlan !== "all" ? "Nenhum usuário encontrado com os filtros" : "Nenhum usuário cadastrado"}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        // Calcular dias restantes
                        const endDate = user.subscription?.end_date ? new Date(user.subscription.end_date) : null;
                        const today = new Date();
                        const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                        const isExpired = daysRemaining !== null && daysRemaining < 0;
                        const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
                        
                        return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{user.full_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{user.company_name || '-'}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-[#FF6400]/10 text-[#FF6400]">
                              {user.plan_id.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {endDate ? (
                              <div className="flex flex-col gap-1">
                                <span className={`font-medium ${
                                  isExpired ? 'text-red-600' : 
                                  isExpiringSoon ? 'text-yellow-600' : 
                                  'text-green-600'
                                }`}>
                                  {isExpired ? '❌ Expirado' : 
                                   isExpiringSoon ? `⚠️ ${daysRemaining} dias` :
                                   `✅ ${daysRemaining} dias`}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {endDate.toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sem assinatura</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowExtendModal(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Estender plano"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBanModal(true);
                                }}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Banir usuário"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deletar usuário"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal - Estender Plano */}
      {showExtendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⏰ Ajustar Plano</h3>
            <p className="text-gray-600 mb-2">
              Usuário: <span className="font-semibold text-gray-900">{selectedUser.full_name}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>
            
            {/* Toggle modo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de ajuste
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustMode("add")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    adjustMode === "add"
                      ? "bg-[#FF6400] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Adicionar dias
                </button>
                <button
                  onClick={() => setAdjustMode("set")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    adjustMode === "set"
                      ? "bg-[#FF6400] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Definir total
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {adjustMode === "add" 
                  ? "Adiciona dias à data de expiração atual" 
                  : "Define nova data de expiração a partir de hoje"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {adjustMode === "add" ? "Quantos dias adicionar?" : "Quantos dias a partir de hoje?"}
              </label>
              <input
                type="number"
                min="1"
                value={daysToExtend}
                onChange={(e) => setDaysToExtend(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400] focus:ring-2 focus:ring-[#FF6400]/20"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setDaysToExtend(7)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">7 dias</button>
                <button onClick={() => setDaysToExtend(30)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">30 dias</button>
                <button onClick={() => setDaysToExtend(90)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">90 dias</button>
                <button onClick={() => setDaysToExtend(365)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">1 ano</button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExtendPlan}
                disabled={actionLoading}
                className="flex-1 bg-[#FF6400] text-white py-2 px-4 rounded-lg hover:bg-[#ff7700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {actionLoading ? "Processando..." : "Confirmar"}
              </button>
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedUser(null);
                  setDaysToExtend(30);
                  setAdjustMode("add");
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Banir Usuário */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">⚠️ Banir Usuário</h3>
            <p className="text-gray-600 mb-2">
              Tem certeza que deseja banir o usuário:
            </p>
            <p className="text-gray-900 font-semibold mb-1">{selectedUser.full_name}</p>
            <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>
            <p className="text-sm text-gray-600 mb-6 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              A assinatura do usuário será cancelada e ele não poderá mais acessar a plataforma.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBanUser}
                disabled={actionLoading}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {actionLoading ? "Processando..." : "Banir"}
              </button>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Deletar Usuário */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">🗑️ Deletar Usuário</h3>
            <p className="text-gray-600 mb-2">
              Tem certeza que deseja deletar permanentemente:
            </p>
            <p className="text-gray-900 font-semibold mb-1">{selectedUser.full_name}</p>
            <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-semibold mb-2">
                ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
              </p>
              <p className="text-sm text-red-700">
                Todos os dados do usuário serão deletados permanentemente do banco de dados.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {actionLoading ? "Deletando..." : "Deletar"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
