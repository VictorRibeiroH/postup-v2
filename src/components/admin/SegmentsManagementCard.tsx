"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3x3, Plus, Trash2, Edit2, Check } from "lucide-react";

type Segment = {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
  display_order: number;
};

export default function SegmentsManagementCard() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("segments")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error("Erro ao carregar segmentos:", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "" });
  };

  const handleAddOrUpdate = async () => {
    if (!formData.name.trim() || !formData.icon.trim()) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      if (editingId) {
        // Update
        const { error } = await supabase
          .from("segments")
          .update({
            name: formData.name.trim(),
            icon: formData.icon.trim(),
          })
          .eq("id", editingId);

        if (error) throw error;
        setMessage({ type: "success", text: "Segmento atualizado!" });
      } else {
        // Insert
        const { error } = await supabase
          .from("segments")
          .insert({
            name: formData.name.trim(),
            icon: formData.icon.trim(),
            display_order: segments.length + 1,
            is_active: true,
          });

        if (error) throw error;
        setMessage({ type: "success", text: "Segmento criado!" });
      }

      resetForm();
      setIsAdding(false);
      setEditingId(null);
      loadSegments();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMessage({ type: "error", text: "Erro ao salvar segmento" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (segment: Segment) => {
    setFormData({
      name: segment.name,
      icon: segment.icon,
    });
    setEditingId(segment.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este segmento?")) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("segments").delete().eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Segmento removido!" });
      loadSegments();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setMessage({ type: "error", text: "Erro ao remover segmento" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciar Segmentos
              </h3>
              <p className="text-sm text-gray-500">
                Configure os segmentos exibidos na landing page
              </p>
            </div>
          </div>
          {!isAdding && (
            <Button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Segmento
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

        {/* Form */}
        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="segmentName" className="text-sm font-medium">
                Nome do Segmento *
              </Label>
              <Input
                id="segmentName"
                placeholder="Ex: Alimentação, Saúde, Pet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmentIcon" className="text-sm font-medium">
                Ícone (Emoji ou URL de Imagem) *
              </Label>
              <Input
                id="segmentIcon"
                placeholder="🍽️ ou https://exemplo.com/icone.png"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                Use um emoji (🍽️, ⚕️, 🏋️) ou cole a URL de uma imagem
              </p>
            </div>

            {/* Preview */}
            {formData.icon && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center justify-center h-24 bg-gray-50 rounded">
                  {formData.icon.startsWith('http') ? (
                    <img
                      src={formData.icon}
                      alt="Preview"
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-6xl">{formData.icon}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddOrUpdate}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Segmento"}
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
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

        {/* Segments Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {segments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Grid3x3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum segmento cadastrado</p>
            </div>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.id}
                className="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all"
              >
                <div className="text-center mb-3">
                  {segment.icon.startsWith('http') ? (
                    <img
                      src={segment.icon}
                      alt={segment.name}
                      className="w-12 h-12 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-5xl mb-2">{segment.icon}</div>
                  )}
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                    {segment.name}
                  </h4>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleEdit(segment)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white text-blue-600 border-blue-300"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(segment.id)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white text-red-600 border-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
