"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

type PlanFeature = {
  id: string;
  feature_text: string;
  display_order: number;
};

type Plan = {
  id: string;
  plan_id: string;
  name: string;
  price: number;
  description: string;
  is_popular: boolean;
  popular_badge: string | null;
  features?: PlanFeature[];
};

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const supabase = createClient();
      const { data: plansData, error: plansError } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (plansError) throw plansError;

      // Carregar features de cada plano
      const plansWithFeatures = await Promise.all(
        (plansData || []).map(async (plan) => {
          const { data: features } = await supabase
            .from("plan_features")
            .select("*")
            .eq("plan_id", plan.id)
            .order("display_order", { ascending: true });
          
          return { ...plan, features: features || [] };
        })
      );

      setPlans(plansWithFeatures);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="planos" className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="planos" className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            PLANOS <span className="text-[#FF6400]">CONTEÚDO</span>: Escolha o
            ideal para o seu negócio!
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Descubra o plano perfeito para impulsionar sua presença digital.
            Nossos pacotes são flexíveis e projetados para atender às
            necessidades de cada negócio, desde o pequeno empreendedor até
            grandes empresas. Escolha o que melhor se adapta aos seus objetivos
            e comece a transformar seus resultados hoje mesmo!
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative backdrop-blur-xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.is_popular
                  ? "bg-gradient-to-br from-[#FF6400]/10 to-white border-[#FF6400] shadow-xl"
                  : "bg-white/70 border-gray-200/50"
              }`}
            >
              {plan.popular_badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF6400] text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.popular_badge}
                  </span>
                </div>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[#FF6400]">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/MÊS</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed min-h-[80px]">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features && plan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#FF6400] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature.feature_text}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/cadastro?plan=${plan.plan_id}`}>
                  <Button
                    className={`w-full font-semibold rounded-xl transition-all ${
                      plan.is_popular
                        ? "bg-[#FF6400] hover:bg-[#e55a00] text-white shadow-lg"
                        : "bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200"
                    }`}
                  >
                    Escolher Plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
