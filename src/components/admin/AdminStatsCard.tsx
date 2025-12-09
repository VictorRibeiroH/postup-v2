"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Activity } from "lucide-react";

type StatsData = {
  totalUsers: number;
  activeSubscriptions: number;
  expiringSoon: number; // próximos 7 dias
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  growthRate: number; // % crescimento mês anterior
  registrationsByMonth: Array<{ month: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
};

type Props = {
  stats: StatsData;
};

export default function AdminStatsCard({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              {stats.growthRate > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total de Usuários</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">
              <span className={stats.growthRate > 0 ? "text-green-600" : "text-red-600"}>
                {stats.growthRate > 0 ? "+" : ""}{stats.growthRate}%
              </span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Assinaturas Ativas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-2">
              {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}% dos usuários
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Expirando em 7 dias</p>
            <p className="text-3xl font-bold text-gray-900">{stats.expiringSoon}</p>
            <p className="text-xs text-yellow-600 mt-2">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6400]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#FF6400]" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Receita Mensal</p>
            <p className="text-3xl font-bold text-gray-900">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total: R$ {stats.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de cadastros */}
        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cadastros por Mês
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.registrationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#FF6400" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de receita */}
        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Receita por Mês
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionais */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Novos usuários (mês)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Taxa de Ativação</p>
            <p className="text-2xl font-bold text-gray-900">
              {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(stats.totalRevenue / stats.activeSubscriptions || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
