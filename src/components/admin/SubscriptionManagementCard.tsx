"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";

type SubscriptionWithUser = {
  id: string;
  user_id: string;
  end_date: string;
  status: string;
  plan_id: string;
  price: number;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
};

type SubscriptionHistory = {
  id: string;
  action: string;
  old_end_date: string | null;
  new_end_date: string | null;
  days_added: number | null;
  created_at: string;
  performed_by: string | null;
  performer: {
    full_name: string;
  } | null;
};

export default function SubscriptionManagementCard() {
  const [expiringSoon, setExpiringSoon] = useState<SubscriptionWithUser[]>([]);
  const [recentChanges, setRecentChanges] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 15 | 30>(7);
  
  // Modal de mensagem
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SubscriptionWithUser | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Buscar assinaturas expirando em breve
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + selectedPeriod);

      const { data: expiring } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .eq("status", "active")
        .lte("end_date", expirationDate.toISOString())
        .gte("end_date", new Date().toISOString())
        .order("end_date", { ascending: true });

      setExpiringSoon(expiring || []);

      // Buscar histórico recente
      const { data: history } = await supabase
        .from("subscription_history")
        .select(`
          *,
          performer:performed_by(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentChanges(history || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageSubject || !messageBody) {
      toast.error("Preencha o assunto e a mensagem");
      return;
    }

    if (!selectedUser.profiles.phone) {
      toast.error("Usuário não possui telefone cadastrado");
      return;
    }

    setSendingMessage(true);
    try {
      const supabase = createClient();
      
      // Formatar telefone (remover caracteres especiais)
      const phone = selectedUser.profiles.phone.replace(/\D/g, '');
      
      // Montar mensagem do WhatsApp
      const whatsappMessage = `*${messageSubject}*\n\n${messageBody}`;
      
      // Abrir WhatsApp Web com a mensagem
      const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      // Salvar log no banco
      await supabase.from("audit_logs").insert({
        action: "whatsapp_sent",
        entity_type: "user",
        entity_id: selectedUser.user_id,
        details: {
          to: selectedUser.profiles.phone,
          subject: messageSubject,
          body: messageBody,
        },
      });

      toast.success(`WhatsApp aberto para ${selectedUser.profiles.full_name}!`);
      setShowMessageModal(false);
      setSelectedUser(null);
      setMessageSubject("");
      setMessageBody("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao abrir WhatsApp");
    } finally {
      setSendingMessage(false);
    }
  };

  const loadTemplate = (template: "reminder" | "offer" | "thanks") => {
    const templates = {
      reminder: {
        subject: "Sua assinatura está expirando em breve 🔔",
        body: `Olá ${selectedUser?.profiles.full_name || ""},

Notamos que sua assinatura do PostUp está expirando em breve. Não perca o acesso a todas as funcionalidades que têm ajudado você a gerenciar suas redes sociais!

Renove agora e continue aproveitando:
✅ Criação ilimitada de artes
✅ Agendamento de posts
✅ Dashboard de análises
✅ E muito mais!

Qualquer dúvida, estamos à disposição.

Equipe PostUp`,
      },
      offer: {
        subject: "Oferta especial para renovação! 🎁",
        body: `Olá ${selectedUser?.profiles.full_name || ""},

Temos uma proposta especial para você! 

Como você é um cliente valioso, preparamos uma oferta exclusiva para renovação da sua assinatura PostUp:

🎉 30% de desconto na renovação
🚀 1 mês extra GRÁTIS
⭐ Acesso antecipado a novos recursos

Esta oferta é válida apenas por tempo limitado. Aproveite agora!

Equipe PostUp`,
      },
      thanks: {
        subject: "Obrigado por fazer parte do PostUp! 💙",
        body: `Olá ${selectedUser?.profiles.full_name || ""},

Queremos agradecer por confiar no PostUp para gerenciar suas redes sociais.

Notamos que sua assinatura está chegando ao fim e gostaríamos de saber: como foi sua experiência?

📞 Agende uma conversa com nossa equipe
💬 Conte-nos como podemos melhorar
🎁 Veja as novidades que preparamos

Estamos aqui para ajudar você a crescer ainda mais!

Com carinho,
Equipe PostUp`,
      },
    };

    const selected = templates[template];
    setMessageSubject(selected.subject);
    setMessageBody(selected.body);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "extended":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "cancelled":
      case "deleted":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Criada",
      extended: "Estendida",
      cancelled: "Cancelada",
      deleted: "Deletada",
      active: "Ativada",
      expired: "Expirada",
    };
    return labels[action] || action;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
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
    <div className="space-y-6">
      {/* Assinaturas expirando */}
      <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Assinaturas Expirando
                </h3>
                <p className="text-sm text-gray-500">
                  {expiringSoon.length} assinatura(s) nos próximos {selectedPeriod} dias
                </p>
              </div>
            </div>

            {/* Filtro de período */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod(7)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedPeriod === 7
                    ? "bg-[#FF6400] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                7 dias
              </button>
              <button
                onClick={() => setSelectedPeriod(15)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedPeriod === 15
                    ? "bg-[#FF6400] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                15 dias
              </button>
              <button
                onClick={() => setSelectedPeriod(30)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedPeriod === 30
                    ? "bg-[#FF6400] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                30 dias
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {expiringSoon.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma assinatura expirando nos próximos {selectedPeriod} dias
              </p>
            ) : (
              expiringSoon.map((sub) => {
                const daysLeft = getDaysRemaining(sub.end_date);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors group"
                  >
                    <button
                      onClick={() => {
                        setSelectedUser(sub);
                        setShowMessageModal(true);
                      }}
                      className="flex-1 text-left hover:bg-yellow-50 -m-4 p-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 group-hover:text-[#FF6400] transition-colors">
                          {sub.profiles.full_name}
                        </p>
                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#FF6400] transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600">{sub.profiles.email}</p>
                    </button>
                    <div className="text-right ml-4">
                      <p className={`font-semibold ${
                        daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-yellow-600" : "text-gray-700"
                      }`}>
                        {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.end_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de mudanças */}
      <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Histórico de Alterações
              </h3>
              <p className="text-sm text-gray-500">
                Últimas 10 mudanças em assinaturas
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentChanges.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma alteração recente
              </p>
            ) : (
              recentChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="mt-1">{getActionIcon(change.action)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getActionLabel(change.action)}
                        </p>
                        {change.days_added && (
                          <p className="text-sm text-gray-600">
                            +{change.days_added} dias adicionados
                          </p>
                        )}
                        {change.performer && (
                          <p className="text-xs text-gray-500">
                            por {change.performer.full_name}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(change.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal - Enviar Mensagem */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Enviar WhatsApp</h3>
                <p className="text-sm text-gray-600">
                  Para: {selectedUser.profiles.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  📱 {selectedUser.profiles.phone || "Telefone não cadastrado"}
                </p>
              </div>
            </div>

            {/* Templates prontos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Templates prontos
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => loadTemplate("reminder")}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  🔔 Lembrete
                </button>
                <button
                  onClick={() => loadTemplate("offer")}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  🎁 Oferta
                </button>
                <button
                  onClick={() => loadTemplate("thanks")}
                  className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  💙 Agradecimento
                </button>
              </div>
            </div>

            {/* Assunto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Digite o assunto da mensagem..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400] focus:ring-2 focus:ring-[#FF6400]/20"
              />
            </div>

            {/* Corpo da mensagem */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6400] focus:ring-2 focus:ring-[#FF6400]/20 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {messageBody.length} caracteres
              </p>
            </div>

            {/* Aviso */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                💬 <strong>WhatsApp:</strong> Ao clicar em enviar, o WhatsApp Web será aberto com a mensagem pronta. 
                Você poderá revisar antes de enviar ao cliente.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageSubject || !messageBody || !selectedUser.profiles.phone}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Abrindo...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Abrir WhatsApp
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedUser(null);
                  setMessageSubject("");
                  setMessageBody("");
                }}
                disabled={sendingMessage}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
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
