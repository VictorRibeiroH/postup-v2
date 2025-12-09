"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, CreditCard, Settings, Clock } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user_id: string | null;
  user: {
    full_name: string;
    email: string;
  } | null;
};

export default function AuditLogsCard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, limit]);

  const loadLogs = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          user:user_id(full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filter !== "all") {
        query = query.eq("entity_type", filter);
      }

      const { data } = await query;
      setLogs(data || []);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (entityType: string | null) => {
    switch (entityType) {
      case "profile":
        return <User className="w-4 h-4 text-blue-600" />;
      case "subscription":
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case "plan":
      case "partner":
      case "segment":
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      user_created: "Usuário criado",
      user_deleted: "Usuário deletado",
      user_type_changed: "Tipo de usuário alterado",
      subscription_created: "Assinatura criada",
      subscription_extended: "Assinatura estendida",
      subscription_status_changed: "Status da assinatura alterado",
      subscription_deleted: "Assinatura deletada",
      plan_created: "Plano criado",
      plan_updated: "Plano atualizado",
      plan_deleted: "Plano deletado",
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes("created")) return "text-green-700 bg-green-50";
    if (action.includes("deleted")) return "text-red-700 bg-red-50";
    if (action.includes("updated") || action.includes("changed") || action.includes("extended"))
      return "text-blue-700 bg-blue-50";
    return "text-gray-700 bg-gray-50";
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6400] mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Logs de Auditoria
              </h3>
              <p className="text-sm text-gray-500">
                {logs.length} registro(s) recente(s)
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400]"
            >
              <option value="all">Todos</option>
              <option value="profile">Usuários</option>
              <option value="subscription">Assinaturas</option>
              <option value="plan">Planos</option>
              <option value="partner">Parceiros</option>
              <option value="segment">Segmentos</option>
            </select>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400]"
            >
              <option value={20}>20 registros</option>
              <option value={50}>50 registros</option>
              <option value={100}>100 registros</option>
            </select>
          </div>
        </div>

        {/* Lista de logs */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum log encontrado
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="mt-1">{getActionIcon(log.entity_type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${getActionColor(
                        log.action
                      )}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  {log.user && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{log.user.full_name}</span>
                      <span className="text-gray-500"> ({log.user.email})</span>
                    </p>
                  )}

                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-gray-600 mt-2">
                      <summary className="cursor-pointer hover:text-gray-900">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
