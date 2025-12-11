"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Download, Trash2, Calendar, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import SchedulePostModal from "./SchedulePostModal";

interface Arte {
  id: string;
  title: string;
  image_url: string;
  width: number;
  height: number;
  created_at: string;
}

export default function ArtesGallery() {
  const [artes, setArtes] = useState<Arte[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedArteId, setSelectedArteId] = useState<string | null>(null);

  useEffect(() => {
    loadArtes();
  }, []);

  const loadArtes = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("artes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtes(data || []);
    } catch (error) {
      console.error("Erro ao carregar artes:", error);
      toast.error("Erro ao carregar artes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta arte?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("artes").delete().eq("id", id);

      if (error) throw error;

      toast.success("Arte deletada com sucesso!");
      loadArtes();
    } catch (error) {
      console.error("Erro ao deletar arte:", error);
      toast.error("Erro ao deletar arte");
    }
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      toast.error("Erro ao fazer download");
    }
  };

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

  if (artes.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma arte criada ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira arte no editor!
            </p>
            <Button
              onClick={() => (window.location.href = "/editor")}
              className="bg-[#FF6400] hover:bg-[#e55a00]"
            >
              Criar Primeira Arte
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Minhas Artes</h3>
            <p className="text-sm text-gray-600 mt-1">
              {artes.length} {artes.length === 1 ? "arte criada" : "artes criadas"}
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = "/editor")}
            className="bg-[#FF6400] hover:bg-[#e55a00]"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Nova Arte
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artes.map((arte) => (
            <div
              key={arte.id}
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={arte.image_url}
                  alt={arte.title}
                  className="w-full h-full object-cover"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => (window.location.href = "/editor?arte=" + arte.id)}
                    className="bg-white hover:bg-gray-100"
                    title="Editar arte"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(arte.image_url, arte.title)}
                    className="bg-white hover:bg-gray-100"
                    title="Baixar arte"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedArteId(arte.id);
                      setScheduleModalOpen(true);
                    }}
                    className="bg-white hover:bg-gray-100"
                    title="Agendar postagem"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(arte.id)}
                    title="Deletar arte"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h4 className="font-semibold text-gray-900 truncate">
                  {arte.title}
                </h4>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    {arte.width}x{arte.height}px
                  </span>
                  <span>
                    {format(new Date(arte.created_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Schedule Post Modal */}
      <SchedulePostModal 
        open={scheduleModalOpen} 
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedArteId(null);
        }}
        onSuccess={() => {
          loadArtes();
        }}
        preSelectedArteId={selectedArteId}
      />
    </Card>
  );
}
