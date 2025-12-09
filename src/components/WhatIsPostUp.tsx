import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Calendar, TrendingUp, Target } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Criar artes e descrições impactantes",
  },
  {
    icon: Calendar,
    title: "Planejar e agendar postagens",
  },
  {
    icon: TrendingUp,
    title: "Analisar o crescimento da sua rede social",
  },
  {
    icon: Target,
    title: "Gerenciar suas campanhas de anúncios",
  },
];

export default function WhatIsPostUp() {
  return (
    <section id="funcionalidades" className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            O que é a <span className="text-[#FF6400]">PostUp</span>?
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            A PostUp foi criada para simplificar o marketing digital,
            transformando processos complexos em ações intuitivas. Com ela, você
            gerencia tudo em um só lugar, desde a criação de conteúdo até a
            gestão de anúncios, sem complicação!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/70 border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF6400]/10 mb-4">
                  <feature.icon className="w-8 h-8 text-[#FF6400]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {feature.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center">
          <p className="text-xl font-medium text-gray-800">
            Tudo isso a um clique de distância, para você focar no que realmente
            importa:{" "}
            <span className="text-[#FF6400] font-bold">
              o sucesso do seu negócio!
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
