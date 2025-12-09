"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type Partner = {
  id: string;
  name: string;
  logo_url?: string;
};

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partner_companies")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder when no partners
  const placeholderPartners: Partner[] = [
    { id: "1", name: "Empresa 1" },
    { id: "2", name: "Empresa 2" },
  ];

  const displayPartners = partners.length > 0 ? partners : placeholderPartners;
  const totalCount = partners.length > 0 ? partners.length : 500;
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Mais de <span className="text-[#FF6400]">{totalCount} empresas</span> confiam
            nos insights do PostUp para alavancar suas vendas. Veja algumas delas:
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            O sucesso dos nossos clientes é a nossa maior prova! Mais de {totalCount} empresas já transformaram seus resultados com a PostUp, alcançando
            novos patamares em suas estratégias de marketing digital. Junte-se a
            essa comunidade de sucesso e veja como podemos impulsionar o seu
            negócio.
          </p>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6400] mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displayPartners.map((partner) => (
              <Card
                key={partner.id}
                className="backdrop-blur-xl bg-white/70 border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                  {partner.logo_url ? (
                    <div className="w-20 h-20 mb-3 relative">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6400]/20 to-[#FF6400]/5 flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-[#FF6400]">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {partner.logo_url ? partner.name : (
                      <>Post<span className="text-[#FF6400]">Up</span></>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
