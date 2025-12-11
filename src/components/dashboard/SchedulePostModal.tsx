/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Facebook, Instagram, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface Arte {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_picture: string;
}

interface SchedulePostModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preSelectedArteId?: string | null;
}

export default function SchedulePostModal({ open, onClose, onSuccess, preSelectedArteId }: SchedulePostModalProps) {
  const [loading, setLoading] = useState(false);
  const [artes, setArtes] = useState<Arte[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedArte, setSelectedArte] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    if (open) {
      loadArtes();
      loadSocialAccounts();
      // Set default date/time to 1 hour from now
      const now = new Date();
      now.setHours(now.getHours() + 1);
      setScheduledDate(now.toISOString().split('T')[0]);
      setScheduledTime(now.toTimeString().slice(0, 5));
      // Set pre-selected arte if provided
      if (preSelectedArteId) {
        setSelectedArte(preSelectedArteId);
      }
    }
  }, [open, preSelectedArteId]);

  const loadArtes = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("artes")
        .select("id, title, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setArtes(data || []);
    } catch (error) {
      console.error("Erro ao carregar artes:", error);
      toast.error("Erro ao carregar suas artes");
    }
  };

  const loadSocialAccounts = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("id, platform, account_name, account_picture")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSchedule = async () => {
    if (!selectedArte) {
      toast.error("Selecione uma arte");
      return;
    }
    if (selectedAccounts.length === 0) {
      toast.error("Selecione pelo menos uma conta social");
      return;
    }
    if (!caption.trim()) {
      toast.error("Escreva uma legenda");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Defina a data e hora");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Get selected arte
      const arte = artes.find(a => a.id === selectedArte);
      if (!arte) throw new Error("Arte não encontrada");

      // Get platforms from selected accounts
      const platforms = [...new Set(
        socialAccounts
          .filter(acc => selectedAccounts.includes(acc.id))
          .map(acc => acc.platform)
      )];

      // Combine date and time
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);

      // Insert scheduled post
      const { error } = await supabase
        .from("scheduled_posts")
        .insert({
          user_id: user.id,
          arte_id: selectedArte,
          title: arte.title,
          content: caption,
          media_urls: [arte.image_url],
          platforms: platforms,
          social_account_ids: selectedAccounts,
          scheduled_for: scheduledFor.toISOString(),
          status: "pending"
        });

      if (error) throw error;

      toast.success("Post agendado com sucesso!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Erro ao agendar post:", error);
      toast.error("Erro ao agendar post");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedArte("");
    setSelectedAccounts([]);
    setCaption("");
    setScheduledDate("");
    setScheduledTime("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Agendar Publicação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Select Arte */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              1. Escolha a Arte
            </Label>
            {artes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Você ainda não criou nenhuma arte. 
                <a href="/editor" className="text-[#FF6400] hover:underline ml-1">
                  Criar agora
                </a>
              </p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {artes.map((arte) => (
                  <button
                    key={arte.id}
                    onClick={() => setSelectedArte(arte.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedArte === arte.id
                        ? "border-[#FF6400] ring-2 ring-[#FF6400] ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={arte.image_url}
                      alt={arte.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedArte === arte.id && (
                      <div className="absolute top-1 right-1 bg-[#FF6400] text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select Social Accounts */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              2. Onde Publicar
            </Label>
            {socialAccounts.length === 0 ? (
              <p className="text-sm text-gray-500">
                Você não tem contas conectadas. 
                <a href="/dashboard/social-accounts" className="text-[#FF6400] hover:underline ml-1">
                  Conectar agora
                </a>
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {socialAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      selectedAccounts.includes(account.id)
                        ? "border-[#FF6400] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={account.account_picture}
                      alt={account.account_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{account.account_name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {account.platform === "facebook" ? (
                          <Facebook className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Instagram className="w-3 h-3 text-pink-600" />
                        )}
                        {account.platform === "facebook" ? "Facebook" : "Instagram"}
                      </div>
                    </div>
                    {selectedAccounts.includes(account.id) && (
                      <div className="text-[#FF6400]">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption" className="text-base font-semibold mb-3 block">
              3. Escreva a Legenda
            </Label>
            <Textarea
              id="caption"
              placeholder="Escreva a legenda do seu post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {caption.length}/2200 caracteres
            </p>
          </div>

          {/* Schedule Date/Time */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              4. Quando Publicar
            </Label>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  now.setHours(now.getHours() + 1);
                  setScheduledDate(now.toISOString().split('T')[0]);
                  setScheduledTime(now.toTimeString().slice(0, 5));
                }}
                className="text-xs"
              >
                ⏰ Daqui 1h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(9, 0);
                  setScheduledDate(tomorrow.toISOString().split('T')[0]);
                  setScheduledTime("09:00");
                }}
                className="text-xs"
              >
                🌅 Amanhã 9h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(18, 0);
                  setScheduledDate(tomorrow.toISOString().split('T')[0]);
                  setScheduledTime("18:00");
                }}
                className="text-xs"
              >
                🌆 Amanhã 18h
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6400]" />
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base h-12 cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6400]" />
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="text-base h-12 cursor-pointer"
                />
              </div>
            </div>

            {/* Preview */}
            {scheduledDate && scheduledTime && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>📅 Publicação agendada para:</strong>{" "}
                  {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {" às "}
                  {scheduledTime}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-[#FF6400] hover:bg-[#E55A00]"
              disabled={loading || !selectedArte || selectedAccounts.length === 0 || !caption.trim()}
            >
              {loading ? "Agendando..." : "Agendar Publicação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
