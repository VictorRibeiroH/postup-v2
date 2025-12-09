"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VideoSection() {
  const [videoId, setVideoId] = useState(process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "dQw4w9WgXcQ");

  useEffect(() => {
    loadVideoId();
  }, []);

  const loadVideoId = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "youtube_video_id")
        .single();

      // Se tiver vídeo no banco, usa ele, senão usa o do .env como fallback
      if (data?.value) {
        setVideoId(data.value);
      }
    } catch (error) {
      console.error("Erro ao carregar vídeo:", error);
      // Em caso de erro, mantém o fallback do .env
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-orange-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Veja como o <span className="text-[#FF6400]">PostUp</span> funciona
            na prática!
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Assista ao nosso vídeo demonstrativo e descubra como é fácil e
            intuitivo gerenciar suas campanhas de marketing digital com a
            PostUp. Entenda cada funcionalidade em detalhes e veja como nossa
            plataforma pode transformar seus resultados.
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/70 border border-gray-200/50 p-4">
            <div className="relative pb-[56.25%] bg-gray-900 rounded-2xl overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="PostUp Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
