"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, Trash2, Image as ImageIcon } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
};

export default function PartnersManagementCard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", logo_url: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partner_companies")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Por favor, selecione uma imagem" });
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Imagem muito grande. Máximo 2MB" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `partner-logos/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      setNewPartner({ ...newPartner, logo_url: publicUrl });
      setMessage({ type: "success", text: "Imagem enviada com sucesso!" });
      setFileInputKey(prev => prev + 1); // Reset file input
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setMessage({ type: "error", text: "Erro ao enviar imagem. Tente usar URL" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPartner.name.trim() || !newPartner.logo_url.trim()) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("partner_companies").insert({
        name: newPartner.name.trim(),
        logo_url: newPartner.logo_url.trim(),
        display_order: partners.length,
        is_active: true,
      });

      if (error) throw error;

      setNewPartner({ name: "", logo_url: "" });
      setIsAdding(false);
      setMessage({ type: "success", text: "Parceiro adicionado com sucesso!" });
      loadPartners();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      setMessage({ type: "error", text: "Erro ao adicionar parceiro" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este parceiro?")) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("partner_companies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Parceiro removido!" });
      loadPartners();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setMessage({ type: "error", text: "Erro ao remover parceiro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Empresas Parceiras
              </h3>
              <p className="text-sm text-gray-500">
                Gerencie os logos exibidos na landing page
              </p>
            </div>
          </div>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add Partner Form */}
        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerName" className="text-sm font-medium">
                Nome da Empresa
              </Label>
              <Input
                id="partnerName"
                placeholder="Ex: Empresa ABC"
                value={newPartner.name}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, name: e.target.value })
                }
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Logo da Empresa
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      uploadMode === 'url'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      uploadMode === 'file'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {uploadMode === 'url' ? (
                <>
                  <Input
                    id="logoUrl"
                    placeholder="https://exemplo.com/logo.png"
                    value={newPartner.logo_url}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, logo_url: e.target.value })
                    }
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    Cole a URL da imagem do logo (PNG, JPG, SVG)
                  </p>
                </>
              ) : (
                <>
                  <Input
                    key={fileInputKey}
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    {uploading ? 'Enviando imagem...' : 'Envie uma imagem (PNG, JPG, SVG - máx. 2MB)'}
                  </p>
                </>
              )}
            </div>

            {/* Preview */}
            {newPartner.logo_url && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center justify-center h-24 bg-gray-50 rounded">
                  <img
                    src={newPartner.logo_url}
                    alt="Preview"
                    className="max-h-20 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Adicionando..." : "Adicionar"}
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewPartner({ name: "", logo_url: "" });
                  setMessage(null);
                }}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Partners List */}
        <div className="space-y-3">
          {partners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum parceiro cadastrado</p>
              <p className="text-sm">Clique em "Adicionar" para começar</p>
            </div>
          ) : (
            partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-white border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {!partner.logo_url && (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {partner.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {partner.logo_url}
                  </p>
                </div>

                <Button
                  onClick={() => handleDelete(partner.id)}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
