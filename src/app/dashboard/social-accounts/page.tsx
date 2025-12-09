"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Instagram, Facebook, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type SocialAccount = {
  id: string;
  platform: string;
  account_name: string;
  account_username: string | null;
  account_picture: string | null;
  is_active: boolean;
  followers_count: number;
  created_at: string;
};

export default function SocialAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      toast.error("Erro ao carregar contas vinculadas");
    } finally {
      setLoading(false);
    }
  };

  const connectFacebook = () => {
    setConnecting(true);
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;
    
    if (!appId || !redirectUri) {
      toast.error("Configuração do Facebook não encontrada");
      setConnecting(false);
      return;
    }

    // Permissões necessárias para publicar no Facebook e Instagram
    const scope = [
      "pages_manage_posts",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
      "business_management",
      "pages_show_list"
    ].join(",");

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=facebook`;
    
    window.location.href = authUrl;
  };

  const connectInstagram = () => {
    // Instagram usa o mesmo fluxo do Facebook (Meta)
    setConnecting(true);
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;
    
    if (!appId || !redirectUri) {
      toast.error("Configuração do Instagram não encontrada");
      setConnecting(false);
      return;
    }

    // Permissões necessárias para Instagram
    const scope = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts"
    ].join(",");

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=instagram`;
    
    window.location.href = authUrl;
  };

  const disconnectAccount = async (accountId: string) => {
    if (!confirm("Tem certeza que deseja desconectar esta conta?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("social_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      toast.success("Conta desconectada com sucesso");
      loadAccounts();
    } catch (error) {
      console.error("Erro ao desconectar conta:", error);
      toast.error("Erro ao desconectar conta");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Redes Sociais</h1>
            <p className="text-gray-600">Conecte suas contas para agendar posts</p>
          </div>
        </div>

        {/* Connect Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Facebook</h3>
                  <p className="text-sm text-gray-600 font-normal">Páginas do Facebook</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Publique automaticamente nas suas páginas do Facebook
              </p>
              <Button
                onClick={connectFacebook}
                disabled={connecting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {connecting ? "Conectando..." : "Conectar Facebook"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 hover:border-pink-400 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Instagram</h3>
                  <p className="text-sm text-gray-600 font-normal">Contas Business</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Agende posts e stories no seu Instagram Business
              </p>
              <Button
                onClick={connectInstagram}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {connecting ? "Conectando..." : "Conectar Instagram"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Contas Conectadas</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma conta conectada ainda</p>
                <p className="text-sm mt-2">Conecte suas redes sociais para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {account.account_picture ? (
                      <img
                        src={account.account_picture}
                        alt={account.account_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        account.platform === 'facebook' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'
                      }`}>
                        {account.platform === 'facebook' ? (
                          <Facebook className="w-6 h-6 text-white" />
                        ) : (
                          <Instagram className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{account.account_name}</h4>
                      {account.account_username && (
                        <p className="text-sm text-gray-600">@{account.account_username}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{account.platform}</span>
                        {account.followers_count > 0 && (
                          <span className="text-xs text-gray-500">
                            {account.followers_count.toLocaleString()} seguidores
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          account.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {account.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => disconnectAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Para Instagram, você precisa de uma conta Business ou Creator</li>
              <li>• As contas devem estar vinculadas a uma Página do Facebook</li>
              <li>• Os tokens de acesso expiram em 60 dias e precisam ser renovados</li>
              <li>• Você mantém controle total das suas contas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
