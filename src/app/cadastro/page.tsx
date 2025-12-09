"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

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
  artes_limit: number;
  has_ads: boolean;
  has_dashboard: boolean;
  features?: PlanFeature[];
};

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanParam = searchParams.get("plan")?.toLowerCase() || "pro";
  
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    planId: selectedPlanParam,
  });
  const [error, setError] = useState("");

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
      setLoadingPlans(false);
    }
  };

  const selectedPlan = plans.find(p => p.plan_id === formData.planId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!selectedPlan) {
      setError("Plano não encontrado");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 2. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        company_name: formData.companyName,
        phone: formData.phone,
        user_type: "user",
        plan_id: selectedPlan.id,
        artes_limit: selectedPlan.artes_limit,
        has_ads: selectedPlan.has_ads,
        has_dashboard: selectedPlan.has_dashboard,
      });

      if (profileError) throw profileError;

      // 3. Create subscription (30 dias de trial)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 dias a partir de hoje

      console.log("Criando subscription:", {
        user_id: authData.user.id,
        plan_id: selectedPlan.id,
        price: selectedPlan.price,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const { data: subData, error: subError } = await supabase.from("subscriptions").insert({
        user_id: authData.user.id,
        plan_id: selectedPlan.id,
        price: selectedPlan.price,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      if (subError) {
        console.error("Erro ao criar subscription:", subError);
        throw subError;
      }
      
      console.log("Subscription criada com sucesso:", subData);

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6400] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o site
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-2xl">
            <CardContent className="p-8">
              {/* Logo */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Post<span className="text-[#FF6400]">Up</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Crie sua conta e comece a gerenciar suas redes sociais
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    required
                    placeholder="João Silva"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                  />
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      Empresa
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Minha Empresa"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planId" className="text-sm font-medium text-gray-700">
                    Plano *
                  </Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, planId: value })
                    }
                    disabled={loadingPlans}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11">
                      <SelectValue placeholder={loadingPlans ? "Carregando planos..." : "Selecione um plano"} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.plan_id}>
                          {plan.name} - R$ {plan.price.toFixed(2)}/mês
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="bg-white border-gray-300 focus:border-[#FF6400] focus:ring-[#FF6400] h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6400] hover:bg-[#e55a00] text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
                >
                  {loading ? "Criando conta..." : "Criar Conta"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-[#FF6400] hover:underline font-medium">
                    Fazer login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Plan Details */}
          <div className="lg:sticky lg:top-8 h-fit">
            {loadingPlans ? (
              <Card className="backdrop-blur-xl bg-white/80 border-2 border-[#FF6400]/30 shadow-2xl">
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ) : selectedPlan ? (
              <Card className="backdrop-blur-xl bg-white/80 border-2 border-[#FF6400]/30 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6400]/10 mb-4">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Plano {selectedPlan.name}
                    </h2>
                    <div className="text-4xl font-bold text-[#FF6400] mb-4">
                      R$ {selectedPlan.price.toFixed(2)}
                      <span className="text-lg text-gray-600 font-normal">/mês</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-gray-900">O que está incluído:</h3>
                    {selectedPlan.features && selectedPlan.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature.feature_text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4 border border-[#FF6400]/20">
                    <h4 className="font-semibold text-gray-900 mb-2">Recursos:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✓ {selectedPlan.artes_limit} artes por mês</li>
                      {selectedPlan.has_ads && <li>✓ Gestão de anúncios</li>}
                      {selectedPlan.has_dashboard && <li>✓ Dashboard completo</li>}
                      <li>✓ Suporte via WhatsApp</li>
                    </ul>
                  </div>

                  <div className="mt-6 text-center">
                    <Link
                      href="/#planos"
                      className="text-sm text-[#FF6400] hover:underline"
                    >
                      Ver todos os planos
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-white/80 border-2 border-gray-300 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Selecione um plano para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
