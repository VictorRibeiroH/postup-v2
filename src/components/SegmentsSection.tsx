"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type Segment = {
  id: number;
  name: string;
  icon: string;
};

export default function SegmentsSection() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("segments")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error("Erro ao carregar segmentos:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Segmentos Atendidos:{" "}
            <span className="text-[#FF6400]">
              Sua Área de Atuação é a Nossa Prioridade!
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            A PostUp é versátil e se adapta às necessidades de diversos setores.
            Não importa qual seja o seu nicho, nossa plataforma oferece as
            ferramentas e insights que você precisa para se destacar. Conheça
            alguns dos segmentos que já confiam na PostUp para impulsionar seus
            resultados:
          </p>
        </div>

        {/* Segments Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="backdrop-blur-xl bg-white/70 border-gray-200/50">
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : segments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>Nenhum segmento disponível no momento</p>
            </div>
          ) : (
            segments.map((segment) => (
              <Card
                key={segment.id}
                className="backdrop-blur-xl bg-white/70 border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FF6400]/30"
              >
                <CardContent className="p-6 text-center">
                  {segment.icon.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={segment.icon}
                      alt={segment.name}
                      className="w-12 h-12 mx-auto mb-4 object-contain"
                    />
                  ) : (
                    <div className="text-5xl mb-4">{segment.icon}</div>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    {segment.name}
                  </h3>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
