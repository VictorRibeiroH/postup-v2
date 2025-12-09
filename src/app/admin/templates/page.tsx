"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  template_key: string;
  thumbnail_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'aniversario', label: '🎉 Aniversário' },
  { value: 'promocao', label: '🔥 Promoções' },
  { value: 'vaga', label: '💼 Vagas' },
  { value: 'dica', label: '💡 Dicas' },
  { value: 'motivacional', label: '✨ Motivacional' },
  { value: 'basico', label: '📐 Básico' },
];

export default function AdminTemplatesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoadTemplates();
  }, []);

  const checkAdminAndLoadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado");
        router.push("/login");
        return;
      }

      // Verificar se é admin (você pode melhorar isso depois com uma coluna is_admin)
      // Por enquanto, vamos permitir acesso e deixar o RLS do banco controlar
      setIsAdmin(true);

      // Carregar todos os templates (incluindo inativos para admin)
      const { data, error } = await supabase
        .from("template_artes")
        .select("*")
        .order("category", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Erro ao carregar templates:", error);
        toast.error("Erro ao carregar templates");
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao verificar permissões");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Redireciona para o editor com flag de criar template
    router.push("/admin/templates/create");
  };

  const handleEdit = (templateId: string) => {
    router.push(`/admin/templates/edit/${templateId}`);
  };

  const handleToggleActive = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("template_artes")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;

      toast.success(template.is_active ? "Template desativado" : "Template ativado");
      checkAdminAndLoadTemplates();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar template");
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja deletar este template?")) return;

    try {
      const { error } = await supabase
        .from("template_artes")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast.success("Template deletado com sucesso!");
      checkAdminAndLoadTemplates();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao deletar template");
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Templates
              </h1>
              <p className="text-sm text-gray-600">
                Crie e edite templates para os usuários
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Novo Template
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Templates Cadastrados ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Nenhum template cadastrado ainda
                </p>
                <Button onClick={handleCreateNew}>
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url}
                            alt={template.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            Sem preview
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.title}</p>
                          {template.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryLabel(template.category)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {template.template_key}
                        </code>
                      </TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <Eye className="w-4 h-4" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                            <EyeOff className="w-4 h-4" />
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{template.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(template)}
                            title={template.is_active ? "Desativar" : "Ativar"}
                          >
                            {template.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(template.id)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
