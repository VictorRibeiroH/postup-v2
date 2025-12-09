"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Plus, Trash2, Edit2, Check, X, Star } from "lucide-react";

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
  display_order: number;
  is_active: boolean;
  is_popular: boolean;
  popular_badge: string | null;
  features?: PlanFeature[];
};

export default function PlansManagementCard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    plan_id: "",
    name: "",
    price: "",
    description: "",
    artes_limit: "4",
    has_ads: false,
    has_dashboard: false,
    is_popular: false,
    popular_badge: "",
    features: [""],
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const supabase = createClient();
      const { data: plansData, error: plansError } = await supabase
        .from("plans")
        .select("*")
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
    }
  };

  const resetForm = () => {
    setFormData({
      plan_id: "",
      name: "",
      price: "",
      description: "",
      artes_limit: "4",
      has_ads: false,
      has_dashboard: false,
      is_popular: false,
      popular_badge: "",
      features: [""],
    });
  };

  const handleAddOrUpdate = async () => {
    if (!formData.name || !formData.price || !formData.plan_id) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      const planData = {
        plan_id: formData.plan_id.toLowerCase().replace(/\s+/g, '_'),
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        artes_limit: parseInt(formData.artes_limit),
        has_ads: formData.has_ads,
        has_dashboard: formData.has_dashboard,
        is_popular: formData.is_popular,
        popular_badge: formData.popular_badge || null,
        display_order: plans.length,
      };

      let planId: string;

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("plans")
          .update(planData)
          .eq("id", editingId);

        if (error) throw error;
        planId = editingId;
        
        // Deletar features antigas
        await supabase.from("plan_features").delete().eq("plan_id", planId);
      } else {
        // Insert
        const { data, error } = await supabase
          .from("plans")
          .insert(planData)
          .select()
          .single();

        if (error) throw error;
        planId = data.id;
      }

      // Inserir features
      const features = formData.features
        .filter(f => f.trim())
        .map((feature, index) => ({
          plan_id: planId,
          feature_text: feature.trim(),
          display_order: index,
        }));

      if (features.length > 0) {
        const { error: featuresError } = await supabase
          .from("plan_features")
          .insert(features);

        if (featuresError) throw featuresError;
      }

      setMessage({ 
        type: "success", 
        text: editingId ? "Plano atualizado!" : "Plano criado!" 
      });
      resetForm();
      setIsAdding(false);
      setEditingId(null);
      loadPlans();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMessage({ type: "error", text: "Erro ao salvar plano" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      plan_id: plan.plan_id,
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description || "",
      artes_limit: plan.artes_limit.toString(),
      has_ads: plan.has_ads,
      has_dashboard: plan.has_dashboard,
      is_popular: plan.is_popular,
      popular_badge: plan.popular_badge || "",
      features: plan.features?.map(f => f.feature_text) || [""],
    });
    setEditingId(plan.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este plano?")) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("plans").delete().eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Plano removido!" });
      loadPlans();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setMessage({ type: "error", text: "Erro ao remover plano" });
    } finally {
      setLoading(false);
    }
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-gray-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciar Planos
              </h3>
              <p className="text-sm text-gray-500">
                Configure os planos de assinatura
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planId" className="text-sm font-medium">
                  ID do Plano *
                </Label>
                <Input
                  id="planId"
                  placeholder="start, pro, enterprise"
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  className="bg-white"
                  disabled={!!editingId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName" className="text-sm font-medium">
                  Nome do Plano *
                </Label>
                <Input
                  id="planName"
                  placeholder="START, PRO, ENTERPRISE"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Preço (R$) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artesLimit" className="text-sm font-medium">
                  Limite de Artes *
                </Label>
                <Input
                  id="artesLimit"
                  type="number"
                  placeholder="4"
                  value={formData.artes_limit}
                  onChange={(e) => setFormData({ ...formData, artes_limit: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição do plano..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ex: 4 artes personalizáveis"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="bg-white"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addFeatureField}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Feature
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasAds"
                  checked={formData.has_ads}
                  onChange={(e) => setFormData({ ...formData, has_ads: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="hasAds" className="text-sm cursor-pointer">
                  Inclui Gestão de Anúncios
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasDashboard"
                  checked={formData.has_dashboard}
                  onChange={(e) => setFormData({ ...formData, has_dashboard: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="hasDashboard" className="text-sm cursor-pointer">
                  Inclui Dashboard
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPopular" className="text-sm cursor-pointer">
                  Marcar como Popular
                </Label>
              </div>
              {formData.is_popular && (
                <Input
                  placeholder="Badge (Ex: MAIS POPULAR)"
                  value={formData.popular_badge}
                  onChange={(e) => setFormData({ ...formData, popular_badge: e.target.value })}
                  className="bg-white"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddOrUpdate}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Plano"}
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

        {/* Plans List */}
        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum plano cadastrado</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-white border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg text-gray-900">
                      {plan.name}
                    </p>
                    {plan.is_popular && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-[#FF6400] text-white rounded">
                        <Star className="w-3 h-3 inline mr-1" />
                        {plan.popular_badge || "POPULAR"}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#FF6400] mb-2">
                    R$ {plan.price.toFixed(2)}/mês
                  </p>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• {plan.artes_limit} artes</p>
                    {plan.has_ads && <p>• Gestão de anúncios</p>}
                    {plan.has_dashboard && <p>• Dashboard completo</p>}
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium mb-1">Features:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {plan.features.map((f) => (
                          <li key={f.id}>{f.feature_text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(plan)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(plan.id)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
