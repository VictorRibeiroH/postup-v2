"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Youtube, Save, X } from "lucide-react";

export default function VideoSettingsCard() {
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadCurrentVideo();
  }, []);

  const loadCurrentVideo = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "youtube_video_id")
        .single();

      const savedVideoId = data?.value || "";
      setCurrentVideoId(savedVideoId);
      setVideoId(savedVideoId);
    } catch (error) {
      console.error("Erro ao carregar vídeo:", error);
    }
  };

  const extractVideoId = (input: string): string => {
    // Se já for só o ID (11 caracteres)
    if (input.length === 11 && !/[^a-zA-Z0-9_-]/.test(input)) {
      return input;
    }

    // Extrair de URL completa do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return input;
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const extractedId = extractVideoId(videoId.trim());

      const { error } = await supabase
        .from("site_settings")
        .update({ value: extractedId || null })
        .eq("key", "youtube_video_id");

      if (error) throw error;

      setCurrentVideoId(extractedId);
      setIsEditing(false);
      setMessage({ type: "success", text: "Vídeo atualizado com sucesso!" });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMessage({ type: "error", text: "Erro ao salvar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVideoId(currentVideoId);
    setIsEditing(false);
    setMessage(null);
  };

  const displayVideoId = currentVideoId || process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "Não configurado";

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vídeo da Landing Page
            </h3>
            <p className="text-sm text-gray-500">
              Configure o vídeo de demonstração do site
            </p>
          </div>
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

        {!isEditing ? (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Vídeo atual:</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {displayVideoId}
              </p>
              {!currentVideoId && (
                <p className="text-xs text-gray-500 mt-1">
                  (Usando vídeo padrão do .env)
                </p>
              )}
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#FF6400] hover:bg-[#e55a00]"
            >
              Alterar Vídeo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoId" className="text-sm font-medium text-gray-700">
                URL ou ID do YouTube
              </Label>
              <Input
                id="videoId"
                placeholder="https://www.youtube.com/watch?v=... ou apenas o ID"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400]"
              />
              <p className="text-xs text-gray-500">
                Cole a URL completa do YouTube ou apenas o ID do vídeo (11 caracteres)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>

            {videoId && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Preview do ID extraído:</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {extractVideoId(videoId) || "ID inválido"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
