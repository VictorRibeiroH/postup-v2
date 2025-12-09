"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const segments = [
  "Alimentação",
  "Saúde",
  "Esporte",
  "Estética",
  "Beleza e bem estar",
  "Advocacia",
  "Arquitetura",
  "Imóveis",
  "Pet",
  "Moda",
];

export default function Hero() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    whatsapp: "",
    segmento: "",
    mensagem: "",
    termos: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termos) {
      alert("Você precisa aceitar os termos de uso e política de privacidade");
      return;
    }

    const message = `Olá, meu nome é ${formData.nome} ${formData.sobrenome} e eu queria informações sobre o ${formData.segmento}:

${formData.mensagem}`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5541988957399";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Seja Você sua{" "}
              <span className="text-[#FF6400]">Agência de</span>{" "}
              <span className="text-[#FF6400]">Marketing Digital</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Gerencie seus conteúdos e acesse insights valiosos para otimizar
              suas campanhas de marketing digital.
            </p>
          </div>

          {/* Right Form */}
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              Entre em contato
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Preencha o formulário e receba informações personalizadas
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome *
                  </Label>
                  <Input
                    id="nome"
                    required
                    placeholder="João"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sobrenome" className="text-sm font-medium text-gray-700">
                    Sobrenome *
                  </Label>
                  <Input
                    id="sobrenome"
                    required
                    placeholder="Silva"
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                    className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                  WhatsApp *
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segmento" className="text-sm font-medium text-gray-700">
                  Segmento *
                </Label>
                <Select
                  required
                  value={formData.segmento}
                  onValueChange={(value) => setFormData({ ...formData, segmento: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11">
                    <SelectValue placeholder="Selecione seu segmento de atuação" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem" className="text-sm font-medium text-gray-700">
                  Mensagem *
                </Label>
                <Textarea
                  id="mensagem"
                  required
                  rows={4}
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] resize-none"
                  placeholder="Conte-nos sobre seu projeto e como podemos ajudar..."
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="termos"
                  required
                  checked={formData.termos}
                  onChange={(e) => setFormData({ ...formData, termos: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#FF6400] border-gray-300 rounded focus:ring-[#FF6400]"
                />
                <Label htmlFor="termos" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  Concordo com os{" "}
                  <a href="#" className="text-[#FF6400] hover:underline font-medium">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-[#FF6400] hover:underline font-medium">
                    política de privacidade
                  </a>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF6400] hover:bg-[#e55a00] text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
